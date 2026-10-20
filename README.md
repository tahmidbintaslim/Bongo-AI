# Bongo AI

**Status: prototype.** There is no live demo. The backend services run locally, but retrieval is mocked, accounts are not implemented and there is no chat UI yet. See [What is not built yet](#what-is-not-built-yet).

Bongo AI is a Yarn workspaces TypeScript monorepo for a Bengali-first study assistant. Today it contains Express services with Bengali and English tutor prompts, bn-BD and en-US UI strings, and early web, mobile and desktop shells.

## What works today

| Part | Path | State |
| --- | --- | --- |
| AI service | `apps/backend/ai-service` (port 4003) | `POST /api/ai/query` sends a Bengali or English tutor prompt to OpenAI (`gpt-3.5-turbo` by default) or Cohere. `POST /api/ai/embed` returns an embedding. `POST /api/ai/search` returns fixtures (see below). Requires a JWT, rate-limited per user, 16 KB body cap. |
| Auth service | `apps/backend/auth-service` (port 4001) | `GET /api/auth/me` returns the claims of a verified token. Register, login, refresh and logout return `501 Not Implemented`. |
| Content service | `apps/backend/content-service` (port 4002) | Create, read, update, delete and list lessons with filters and pagination. Requires a JWT. Stored in memory, so data is lost on restart. |
| Analytics service | `apps/backend/analytics-service` (port 4004) | Track events and read per-user and aggregate counts. Requires a JWT. Stored in memory. |
| API gateway | `apps/backend/api-gateway` (port 4000) | Proxies to the four services. GET requests work; proxied POST and PUT requests hang (see [Known issues](#known-issues)). |
| i18n | `packages/i18n` | bn-BD and en-US strings with i18next. bn-BD is the default. |
| Shared | `packages/shared` | Zod schemas, shared types and small utilities. |
| UI components | `packages/ui-components` | `Button`, `Card` and `Input` for React Native and React Native Web. |

The backend services have jest tests covering authentication, the AI limits and CORS. GitHub Actions is set up to run lint, build and tests on pushes and pull requests to `main`.

## What is not built yet

- **Retrieval.** `VectorStoreService.search()` returns the same two hardcoded documents for every query ("Bangladesh is a country in South Asia..." and "Mathematics is an important subject..."). `/query` sends them to the model as context and lists them as sources, so answers are not grounded in your content. Nothing calls the Pinecone `insert()`. Weaviate and Chroma are declared dependencies but are not used.
- **Accounts.** There is no user store. No service connects to Postgres, Redis or MongoDB, so the auth service cannot register users, check passwords, issue, refresh or revoke tokens. For local development you mint a token yourself (see [Quick start](#quick-start)).
- **Authorization.** Any valid token can read, change and delete all content and read every user's analytics. There are no roles or ownership checks.
- **Chat UI.** The web app (`apps/web`) renders one welcome card and its "শুরু করুন" (Get started) button does nothing. No client calls the API.
- **Mobile.** `apps/mobile` has two placeholder screens with no forms and no API calls. There is no `android/` or `ios/` project, so it cannot run on a device.
- **Desktop.** `apps/desktop` is an Electron shell. Its production build loads the wrong path and does not package the web bundle. There is no Tauri app.
- **Docker.** `docker-compose.yml` defines Postgres, Redis and MongoDB containers that no service uses, and the service images do not build: the content and analytics Dockerfiles copy files from outside their build context, and the ai, auth and gateway Dockerfiles run `npm install`, which cannot fetch the unpublished `@bongo-ai/shared` package.
- **Infrastructure.** Terraform in `infrastructure/terraform` defines a VPC, RDS, ElastiCache and S3 in `ap-south-1` (Mumbai, India). It defines no compute, so nothing in this repo deploys the services.
- **Offline mode, metrics, tracing, data residency or compliance work.** None of these exist.

## Quick start

Requirements: Node.js 22 (CI uses 22) and Yarn 1.22. Run every command from the repo root.

```bash
git clone https://github.com/tahmidbintaslim/bongo-ai.git
cd bongo-ai
yarn install --frozen-lockfile
```

Set the shared settings in your shell. Each service loads `.env` from its own folder, so exporting the variables is the simplest way to give every service the same values. See [`.env.example`](.env.example) for the full list.

```bash
export JWT_SECRET="$(openssl rand -hex 32)"   # required, at least 32 characters
export CORS_ORIGINS="http://localhost:3000"   # browser origins allowed to call the API
export OPENAI_API_KEY="sk-..."                # or: export AI_PROVIDER=cohere COHERE_API_KEY=...
```

Start the services you need, one per terminal, with the same variables exported:

```bash
yarn backend:ai          # http://localhost:4003
yarn backend:content     # http://localhost:4002
yarn backend:analytics   # http://localhost:4004
yarn backend:auth        # http://localhost:4001
```

A service refuses to start if `JWT_SECRET` is missing or too short, or if `CORS_ORIGINS` is malformed.

There is no login yet, so mint a short-lived access token with the same secret:

```bash
TOKEN=$(node -e "console.log(require('jsonwebtoken').sign({ userId: 'local-dev', role: 'student' }, process.env.JWT_SECRET, { algorithm: 'HS256', expiresIn: '1h' }))")
```

Ask a question in Bengali:

```bash
curl -s -X POST http://localhost:4003/api/ai/query \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"query": "সালোকসংশ্লেষণ কী?", "language": "bn"}'
```

Without an OpenAI or Cohere key, `/query` and `/embed` return `500` with `"Failed to process query"` or `"Failed to create embedding"`. `/search` works without a key because it only returns the fixtures.

Anyone who knows `JWT_SECRET` can mint tokens, so keep it private and do not expose these services to the internet with self-minted tokens.

## Configuration

| Variable | Used by | Default | Notes |
| --- | --- | --- | --- |
| `JWT_SECRET` | auth, content, ai, analytics | none | Required, at least 32 characters. Tokens are verified as HS256 and must carry `userId` and `exp`. |
| `CORS_ORIGINS` | all five services | empty | Comma-separated exact origins. Empty blocks every cross-origin browser request. Wildcards and trailing slashes are rejected at startup. |
| `AI_PROVIDER` | ai | `openai` | `openai` or `cohere`. |
| `OPENAI_API_KEY`, `OPENAI_MODEL` | ai | model `gpt-3.5-turbo` | Use a key with a spending limit. |
| `COHERE_API_KEY` | ai | none | |
| `AI_RATE_LIMIT_MAX_REQUESTS`, `AI_RATE_LIMIT_WINDOW_MS` | ai | 20 per 900000 ms | Per user, across all `/api/ai/*` routes. |
| `AI_MAX_BODY_BYTES` | ai | 16384 | Larger JSON bodies get `413`. |
| `RATE_LIMIT_MAX_REQUESTS`, `RATE_LIMIT_WINDOW_MS` | auth, content, analytics | 100 per 900000 ms | Per IP. |
| `PORT` | each service | 4000 to 4004 | Set per service, not once for all. |

## Authentication

Every route on the ai, content and analytics services, plus `GET /api/auth/me`, requires `Authorization: Bearer <token>`. `/health` is public, and the four account endpoints below answer `501` with or without a token. The token must be an HS256 JWT signed with `JWT_SECRET` that carries a `userId` and an `exp` claim. Missing, forged, unsigned, expired and non-expiring tokens get `401`.

`POST /api/auth/register`, `/login`, `/refresh` and `/logout` return `501` until a user store exists. They used to accept any email with the password `password123` and sign tokens with a fallback secret; that code is gone. Without a token store there is no server-side logout: a token stays valid until it expires, or until you rotate `JWT_SECRET`, which invalidates every token.

## Development

```bash
yarn lint                                   # ESLint in every workspace
yarn test                                   # jest in every workspace
yarn workspace @bongo-ai/ai-service build   # tsc for one workspace
yarn workspace @bongo-ai/web build          # webpack production build of the web shell
```

Build the shared packages (`i18n`, `shared`, `ui-components`) before the web app. The root `yarn build` stops at the mobile workspace, which has no build script, so CI builds each workspace explicitly (see [`.github/workflows/ci-cd.yml`](.github/workflows/ci-cd.yml)).

## Project structure

```
bongo-ai/
├── apps/
│   ├── backend/
│   │   ├── ai-service/          # Tutor prompts, OpenAI or Cohere, mocked search
│   │   ├── auth-service/        # Token check for /me; account endpoints return 501
│   │   ├── content-service/     # In-memory lesson CRUD
│   │   ├── analytics-service/   # In-memory event tracking
│   │   └── api-gateway/         # Proxy to the four services
│   ├── web/                     # React Native Web shell (one screen)
│   ├── mobile/                  # React Native screens, no native projects
│   └── desktop/                 # Electron shell
├── packages/
│   ├── i18n/                    # bn-BD and en-US strings
│   ├── shared/                  # Zod schemas, types, utilities
│   └── ui-components/           # Button, Card, Input
├── infrastructure/terraform/    # VPC, RDS, ElastiCache, S3; no compute
├── docs/                        # Architecture, API, deployment notes
└── docker-compose.yml           # Databases start; service images do not build
```

## Known issues

- The API gateway parses JSON before proxying, which consumes the request body, so POST and PUT requests through port 4000 hang. Call the services on their own ports.
- The root `yarn build` fails because `apps/mobile` has no build script.
- The Docker images for the services do not build (see [What is not built yet](#what-is-not-built-yet)), and the Dockerfiles have no non-root `USER`.
- The AI service uses older models and APIs (`gpt-3.5-turbo`, `text-embedding-ada-002` and Cohere's `generate` endpoint) that may need updating.
- Rate-limit counters live in memory, so they reset on restart and are not shared between instances.

## Documentation

- [Architecture](docs/ARCHITECTURE.md): how the pieces fit together today.
- [API](docs/API.md): endpoints, status codes and limits.
- [Security](SECURITY.md): what is in place, what is not, and how to report a problem.
- [Deployment](docs/DEPLOYMENT.md): an earlier deployment plan that has not been verified.
- [Contributing](CONTRIBUTING.md)

## License

MIT. See [LICENSE](LICENSE).

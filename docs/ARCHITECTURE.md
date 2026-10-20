# Architecture

Status: prototype. This page describes the code as it is today. Parts that are planned but not built are listed at the end.

## Overview

```
Clients (none of them call the API yet)
  apps/web       React Native Web, one static welcome screen
  apps/mobile    React Native screens, no android/ or ios/ project
  apps/desktop   Electron shell around the web build

API gateway :4000 (optional; proxied POST and PUT hang, see README)
  |
  +-- auth-service      :4001   /api/auth       token check for /me, other routes 501
  +-- content-service   :4002   /api/content    in-memory lesson CRUD
  +-- ai-service        :4003   /api/ai         tutor prompts -> OpenAI or Cohere
  +-- analytics-service :4004   /api/analytics  in-memory event tracking

docker-compose: Postgres, Redis and MongoDB containers that no service uses
```

## Services

Each backend service is an Express 4 app in `apps/backend/<name>` with the same layout:

- `src/index.ts` loads `.env` first, validates the configuration with `loadConfig()` and exits with a clear message if it is wrong, then listens.
- `src/app.ts` exports `createApp(config)`. The tests use it to start the app on a random port.
- `src/config.ts` reads environment variables through the helpers in `src/utils/env.ts`.
- `src/middleware/auth.middleware.ts` verifies Bearer JWTs. The gateway has no copy; it does not check tokens and leaves that to the services.

The auth middleware and the env helpers are identical copies in each service, like the logger and validation files. Change them together until the services merge into one API.

### AI service (port 4003)

- `POST /api/ai/query`: takes `query` and `language` (`bn` or `en`). It calls `VectorStoreService.search()`, builds a Bengali or English tutor prompt with the results as numbered context, and sends it to OpenAI chat completions (`OPENAI_MODEL`, default `gpt-3.5-turbo`, up to 1000 tokens) or to Cohere `generate`. It returns `{ response, sources }`.
- `POST /api/ai/embed`: returns an embedding from OpenAI `text-embedding-ada-002` or Cohere `embed-multilingual-v3.0`.
- `POST /api/ai/search`: returns the search results directly.
- Search is mocked: it returns the same two hardcoded documents for every query. `VectorStoreService.insert()` can upsert to Pinecone, but no route calls it.

Middleware order on `/api/ai`: `requireAuth`, then the per-user rate limiter, then `express.json` with the body cap, then the routes. Unauthenticated requests are rejected before their body is read.

### Auth service (port 4001)

- `GET /api/auth/me` returns the claims of the verified token (`userId`, and `email` and `role` when present).
- `POST /api/auth/register` and `/login` validate their bodies with Zod and then return `501`. `/refresh` and `/logout` return `501`.
- There is no user store. `pg`, `redis` and `bcrypt` are declared dependencies of the auth service, but nothing imports them.

### Content service (port 4002)

- `POST /api/content`, `GET /api/content` (filters: `category`, `level`, `language`, `tags`, `search`; pagination: `page`, `limit` up to 100), `GET`, `PUT` and `DELETE /api/content/:id`.
- Stored in a `Map` in process memory. `createdBy` is the `userId` from the creator's token; updates cannot change it.

### Analytics service (port 4004)

- `POST /api/analytics/events`, `GET /api/analytics/events`, `GET /api/analytics/stats/user/:userId`, `GET /api/analytics/stats/aggregate`.
- Stored in an array in process memory. The event's `userId` comes from the request body, not the token.

### API gateway (port 4000)

Proxies `/api/auth`, `/api/content`, `/api/ai` and `/api/analytics` to the services with `http-proxy-middleware`, and forwards the `Authorization` header. It parses JSON before proxying, which consumes the body, so POST and PUT requests hang. `http-proxy-middleware` is not listed in its own `package.json` and resolves through workspace hoisting.

## Authentication model

- Tokens are HS256 JWTs signed with `JWT_SECRET`, with `userId` and `exp` claims. All services that check tokens share the same secret.
- Nothing issues tokens yet. For local development you sign one with the secret (see the README quick start).
- There is no refresh token, no revocation and no logout on the server.

## Limits

- `/api/ai/*`: per user, 20 requests per 15 minutes by default, keyed by the token's `userId`. JSON bodies over 16 KB get `413`.
- auth, content and analytics: per IP, 100 requests per 15 minutes by default.
- gateway: per IP, 100 requests per 15 minutes.
- All counters are in memory per process.

## Shared packages

- `packages/i18n`: bn-BD and en-US strings and an i18next setup with bn-BD as the default and en-US as the fallback. The mobile app uses it; the web app does not yet.
- `packages/shared`: Zod schemas (user, content, AI query, analytics event), shared types and small utilities. The services do not import it yet.
- `packages/ui-components`: `Button`, `Card` and `Input` for React Native and React Native Web. The web app uses `Button` and `Card`.

## Infrastructure

- `docker-compose.yml` defines Postgres 15, Redis 7 and MongoDB 6 with development passwords, plus the five services. The services require `JWT_SECRET` and pass `CORS_ORIGINS`. The service images do not build today.
- `infrastructure/terraform` defines a VPC, subnets, RDS Postgres, ElastiCache Redis and an S3 bucket in `ap-south-1` (Mumbai, India). It defines no compute for the services.
- `.github/workflows/ci-cd.yml` installs with the frozen lockfile, lints, builds the packages, the five services and the web and desktop shells, and runs the tests on Node 22.

## Not built yet

- Real retrieval: an ingest step (chunk, embed, store) and a vector search that returns cited sources from your own content.
- A user store with hashed passwords, refresh tokens and revocation, then roles and ownership checks.
- Persistence for content and analytics.
- A chat UI in the web app that calls the API.
- Working Docker images, and a gateway that forwards request bodies.
- Mobile and desktop apps that run.

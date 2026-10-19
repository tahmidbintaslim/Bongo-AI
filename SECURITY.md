# Security

Bongo AI is a prototype. It is not ready for production or for real student data. This page lists what the code does today and what it does not do.

## Reporting a vulnerability

Please do not open a public issue. Report it privately through GitHub's private vulnerability reporting on this repository (Security tab, "Report a vulnerability"). If that option is not available, contact the maintainer through [github.com/tahmidbintaslim](https://github.com/tahmidbintaslim). There is no bug bounty.

## In place

- **Token checks.** Every route except `/health` in the ai, content and analytics services, and `GET /api/auth/me`, requires `Authorization: Bearer <JWT>`. Tokens are verified with `JWT_SECRET` as HS256 only and must carry `userId` and `exp`. Missing, forged, unsigned, expired and non-expiring tokens get `401` (`src/middleware/auth.middleware.ts` in each service).
- **No fallback secrets.** The auth, content, ai and analytics services refuse to start unless `JWT_SECRET` is set and at least 32 characters long. `docker-compose.yml` also requires it.
- **No password handling.** Register, login, refresh and logout return `501`. The earlier mock login that accepted any email with `password123` has been removed.
- **AI key protection.** Every `/api/ai/*` request is rate-limited per user (default 20 per 15 minutes), JSON bodies over 16 KB get `413`, and `query` and `text` must be strings. Authentication runs before the body is read.
- **CORS allowlist.** All five services send CORS headers only to the exact origins in `CORS_ORIGINS`. Empty means none. Wildcards are rejected at startup.
- **Headers and limits.** Every service uses `helmet` defaults. The auth, content and analytics services also rate-limit per IP (default 100 per 15 minutes).
- **Input validation.** Zod schemas validate content create and update bodies, analytics events, and the register and login bodies.
- **Errors.** `500` responses return a generic message. The error detail is included only when `NODE_ENV=development`.
- **Secrets in git.** No secrets are committed. `.env` is gitignored and `.env.example` has empty placeholders.
- **Dependencies.** Some transitive advisories are pinned through `resolutions` in `package.json` (for example `proxy-addr` under Express and `fast-uri` under the Pinecone client).

## Not in place

- **Accounts and sessions.** There is no user store, so there is no password storage, refresh-token rotation or server-side logout. A token stays valid until it expires, or until `JWT_SECRET` is rotated, which invalidates every token.
- **Authorization.** Any valid token can read, change and delete all content and read every user's analytics. Analytics events accept any `userId` in the body. There are no roles or ownership checks.
- **Persistence and encryption at rest.** Content and analytics live in process memory. No service connects to Postgres, Redis or MongoDB.
- **Shared rate limits.** Counters are in memory per process, so they reset on restart and are not shared between instances. Behind the gateway or another proxy, the per-IP limits see the proxy's address because `trust proxy` is not configured.
- **Containers.** The Dockerfiles have no non-root `USER`, and the service images do not build today.
- **Cloud setup.** The Terraform has no IAM roles, secrets manager, WAF or compute. It is not a hardened deployment.
- **Compliance.** No data residency, GDPR or Bangladesh-specific compliance work has been done. The Terraform region `ap-south-1` is Mumbai, India.
- **Privacy in logs.** The AI service logs the user id and the first 50 characters of every query.
- **Prompt injection.** User input goes into the model prompt as is. There is no filtering.
- **Dependency advisories.** `yarn audit` still reports many high and critical advisories, mostly in the React Native, Electron and webpack toolchains. In the backend path the open ones are `tar` (used when `bcrypt` builds at install time), `fast-xml-parser` (in the AWS SDK that `cohere-ai` bundles) and `path-to-regexp`. Clearing them needs major upgrades.
- **Security scanning.** `.github/workflows/security.yml` (CodeQL, Trivy, `yarn audit`) is not running and uses outdated action versions.

## Before any shared deployment

1. Add a real user store with hashed passwords, refresh-token storage and revocation, then roles and ownership checks.
2. Set a long random `JWT_SECRET` and keep it out of the repo.
3. Set `CORS_ORIGINS` to the exact web origins.
4. Use an LLM key with a hard spending limit, and keep the per-user AI limit.
5. Change the development database passwords in `docker-compose.yml`, run containers as a non-root user and put the services behind TLS.

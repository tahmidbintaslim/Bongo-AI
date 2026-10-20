# API

Status: prototype. Call each service on its own port. The gateway on port 4000 proxies GET requests, but proxied POST and PUT requests hang (see the README).

| Service | Base URL |
| --- | --- |
| auth | `http://localhost:4001/api/auth` |
| content | `http://localhost:4002/api/content` |
| ai | `http://localhost:4003/api/ai` |
| analytics | `http://localhost:4004/api/analytics` |

Every service also serves `GET /health` without authentication.

## Authentication

Every route below needs an access token:

```
Authorization: Bearer <access_token>
```

The token is an HS256 JWT signed with `JWT_SECRET` that carries `userId` and `exp`. Nothing issues tokens yet; see the README quick start for signing one locally. A missing or invalid token gets:

```json
{ "success": false, "error": "Authentication required" }
```

or `"Invalid or expired token"`, with status `401` and a `WWW-Authenticate: Bearer` header.

## Auth service

### POST /auth/register, POST /auth/login

Not implemented. There is no user store. The request body is validated (register: `email`, `password` of 8 or more characters, `name`; login: `email`, `password`), then the service answers `501`:

```json
{
  "success": false,
  "error": "Not implemented",
  "message": "Accounts are not implemented yet. There is no user store, so this service cannot register users, check passwords, issue or refresh tokens, or revoke them. See the Authentication section of the README."
}
```

An invalid body gets `400` with `"Validation failed"` and the Zod issues in `details`.

### POST /auth/refresh, POST /auth/logout

Not implemented. Always `501` with the same body as above.

### GET /auth/me

Returns the claims of the verified token. There is no user record behind it.

```json
{
  "success": true,
  "data": { "userId": "local-dev", "role": "student" }
}
```

## AI service

All `/ai/*` routes share a per-user rate limit (default 20 requests per 15 minutes). JSON bodies over `AI_MAX_BODY_BYTES` (default 16384) get `413`, and malformed JSON gets `400`. Over the limit:

```json
{ "success": false, "error": "Too many AI requests. Try again later." }
```

with status `429` and `RateLimit-*` headers.

### POST /ai/query

Sends a Bengali or English tutor prompt to the configured provider (OpenAI or Cohere).

Request:

```json
{ "query": "গণিতে সাহায্য প্রয়োজন", "language": "bn" }
```

`query` must be a non-empty string. `language` is `bn` (default) or `en`.

Response:

```json
{
  "success": true,
  "data": {
    "response": "...",
    "sources": [
      { "id": "1", "title": "বাংলাদেশ সম্পর্কে", "relevance": 0.95 },
      { "id": "2", "title": "গণিত", "relevance": 0.87 }
    ]
  }
}
```

Retrieval is mocked: the two sources are the same hardcoded documents for every query, and they are sent to the model as context. Without a provider key the route returns `500` with `"Failed to process query"`.

### POST /ai/embed

Request:

```json
{ "text": "নমুনা বাংলা লেখা" }
```

`text` must be a non-empty string (arrays are rejected). Response:

```json
{ "success": true, "data": { "embedding": [0.1, 0.2], "dimensions": 1536 } }
```

`dimensions` depends on the provider: OpenAI `text-embedding-ada-002` returns 1536, Cohere `embed-multilingual-v3.0` returns 1024.

### POST /ai/search

Request:

```json
{ "query": "mathematics lesson", "language": "en" }
```

Returns the two hardcoded documents, in Bengali or English depending on `language`. It does not call a provider.

## Content service

Stored in memory; data is lost on restart.

- `POST /content`: create. Body: `title` (1 to 200 characters), `body`, `category`, optional `description`, `tags`, `level` (`beginner`, `intermediate`, `advanced`), `language` (`bn` or `en`), `metadata`. Returns `201` with the item; `createdBy` is the token's `userId`, and `PUT` cannot change it.
- `GET /content`: list. Query: `category`, `level`, `language`, `tags` (repeat the parameter for several), `search`, `page`, `limit` (default 20, max 100).
- `GET /content/:id`, `PUT /content/:id`, `DELETE /content/:id`.

Any valid token can change or delete any item.

## Analytics service

Stored in memory; data is lost on restart.

- `POST /analytics/events`: body `userId`, `eventType`, optional `eventData`, `timestamp` (ISO 8601), `sessionId`, `metadata`. Returns `201`.
- `GET /analytics/events`: query `userId`, `eventType`, `startDate`, `endDate`, `limit` (default 100).
- `GET /analytics/stats/user/:userId`: event count and breakdown for one user.
- `GET /analytics/stats/aggregate`: totals, breakdown and the 10 most active users.

`userId` comes from the request body, and any valid token can read every user's events.

## Errors and status codes

Errors use this shape:

```json
{ "success": false, "error": "Error message" }
```

| Status | Meaning |
| --- | --- |
| `200`, `201` | Success |
| `400` | Invalid body or query |
| `401` | Missing, invalid or expired token |
| `404` | Unknown route or item |
| `413` | AI request body too large |
| `429` | Rate limit exceeded |
| `500` | Server or provider error |
| `501` | Account endpoint not implemented |

The auth, content and analytics services also rate-limit per IP (default 100 requests per 15 minutes) and answer `429` with a plain-text message.

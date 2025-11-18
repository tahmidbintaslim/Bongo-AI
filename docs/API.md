# API Documentation

## Base URL
```
http://localhost:4000/api
```

## Authentication

All authenticated endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <access_token>
```

## Endpoints

### Auth Service

#### POST /auth/register
Register a new user.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "User Name"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "User Name",
    "role": "student",
    "locale": "bn-BD"
  },
  "message": "User registered successfully"
}
```

#### POST /auth/login
Login with credentials.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "accessToken": "jwt_token",
    "refreshToken": "refresh_token",
    "expiresIn": 604800,
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "role": "student"
    }
  }
}
```

#### POST /auth/refresh
Refresh access token.

**Request:**
```json
{
  "refreshToken": "refresh_token"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "accessToken": "new_jwt_token",
    "expiresIn": 604800
  }
}
```

#### GET /auth/me
Get current user profile (requires authentication).

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "User Name",
    "role": "student"
  }
}
```

### AI Service

#### POST /ai/query
Ask a question to the AI assistant.

**Request:**
```json
{
  "query": "গণিতে সাহায্য প্রয়োজন",
  "userId": "uuid",
  "language": "bn"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "response": "আমি আপনাকে গণিতে সাহায্য করতে পারি...",
    "sources": [
      {
        "id": "1",
        "title": "গণিত পাঠ",
        "relevance": 0.95
      }
    ]
  }
}
```

#### POST /ai/embed
Create embeddings for text.

**Request:**
```json
{
  "text": "Sample text in Bengali",
  "language": "bn"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "embedding": [0.1, 0.2, ...],
    "dimensions": 1536
  }
}
```

#### POST /ai/search
Search for relevant content.

**Request:**
```json
{
  "query": "mathematics lesson",
  "language": "bn",
  "limit": 10
}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "content": "Content text...",
      "metadata": {
        "title": "Title",
        "score": 0.95
      }
    }
  ]
}
```

## Error Responses

All endpoints return errors in this format:

```json
{
  "success": false,
  "error": "Error message"
}
```

### HTTP Status Codes

- `200 OK` - Request succeeded
- `201 Created` - Resource created
- `400 Bad Request` - Invalid request
- `401 Unauthorized` - Authentication required
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `429 Too Many Requests` - Rate limit exceeded
- `500 Internal Server Error` - Server error

## Rate Limiting

- Window: 15 minutes
- Max requests: 100 per window
- Applies to all `/api/*` routes

## Pagination

Endpoints that return lists support pagination:

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20, max: 100)

**Response includes:**
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

# API Specification: REST Endpoints

**Phase**: 2 (Full-Stack Web Application)
**Created**: 2026-01-19
**Updated**: 2026-01-26
**Status**: Draft
**Related Features**: @specs/features/authentication/spec.md, @specs/features/task-crud/spec.md

## Changes Summary (2026-01-26)

- Added "Frontend Token Attachment" section (api-client.ts pattern)
- Added "Backend Authentication Middleware" section (validate_user_access flow)
- Added "CORS Configuration" section for cross-origin requests
- Added "Error Response Structure" section with frontend handling guidance
- Added strict query parameter validation details
- Added optional pagination parameters (page, limit) for future use
- Added "Task Ownership Enforcement" section per endpoint
- Added rate limiting recommendations for task endpoints (Phase 3)
- Updated Error Codes Summary with detailed response bodies
- Updated Assumptions and Dependencies

---

## Overview

RESTful API endpoints for task management in the Todo application. All endpoints require JWT authentication and enforce user isolation - users can only access their own tasks.

---

## Frontend Token Attachment

### Problem: 401 Unauthorized on Protected Endpoints

If the JWT token is not attached to API calls, all protected endpoints return `401 Unauthorized`.

### Solution: API Client with Automatic Token Attachment

Create a reusable API client that automatically attaches the JWT token to every request.

**File**: `frontend/lib/api-client.ts`

```typescript
import { authClient } from "./auth-client";

export async function apiClient(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  // Get session with JWT token
  const session = await authClient.getSession();

  if (!session?.session?.token) {
    // No token - redirect to login
    window.location.href = "/signin";
    throw new Error("Not authenticated");
  }

  // Attach token to Authorization header
  const headers = new Headers(options.headers);
  headers.set("Authorization", `Bearer ${session.session.token}`);
  headers.set("Content-Type", "application/json");

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}${endpoint}`,
    {
      ...options,
      headers,
    }
  );

  // Handle 401 responses - redirect to login
  if (response.status === 401) {
    window.location.href = "/signin?error=session_expired";
    throw new Error("Session expired");
  }

  return response;
}
```

### Token Format

The JWT token must be attached in the `Authorization` header using the Bearer scheme:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Token Structure** (decoded):
```json
{
  "sub": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com",
  "iat": 1706198400,
  "exp": 1706803200
}
```

- `sub`: User ID (UUID) - used for user isolation
- `email`: User's email address
- `iat`: Issued at timestamp
- `exp`: Expiration timestamp (7 days from issuance)

### Usage in Components

```typescript
// List tasks
const response = await apiClient("/api/{user_id}/tasks");
const data = await response.json();

// Create task
const response = await apiClient("/api/{user_id}/tasks", {
  method: "POST",
  body: JSON.stringify({ title: "New Task" }),
});

// Update task
const response = await apiClient("/api/{user_id}/tasks/{task_id}", {
  method: "PATCH",
  body: JSON.stringify({ completed: true }),
});
```

---

## Backend Authentication Middleware

### Authentication Flow

1. Request arrives with `Authorization: Bearer <token>` header
2. Middleware extracts token from header
3. Token decoded and verified using `BETTER_AUTH_SECRET` (HS256)
4. Expiration (`exp`) claim validated
5. `user_id` extracted from `sub` claim
6. Path `{user_id}` validated against JWT `sub` claim
7. Request proceeds with authenticated `user_id`

### Middleware Implementation

**File**: `backend/src/api/middleware/auth.py`

```python
import os
import jwt
from jwt.exceptions import ExpiredSignatureError, InvalidTokenError
from fastapi import HTTPException, Depends, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

security = HTTPBearer()

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> str:
    """
    Verify JWT token and return user_id.
    Raises HTTPException(401) if invalid/expired/missing.
    """
    token = credentials.credentials
    secret = os.getenv("BETTER_AUTH_SECRET")

    if not secret:
        raise HTTPException(status_code=500, detail="Auth not configured")

    try:
        payload = jwt.decode(token, secret, algorithms=["HS256"])
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(
                status_code=401,
                detail="Invalid token payload"
            )
        return user_id
    except ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")


def validate_user_access(
    path_user_id: str,
    current_user: str = Depends(get_current_user)
) -> str:
    """
    Validate that path user_id matches the authenticated user.
    Prevents accessing other users' resources.
    """
    if path_user_id != current_user:
        raise HTTPException(
            status_code=401,
            detail="User ID mismatch"
        )
    return current_user
```

### Route Usage

```python
from fastapi import APIRouter, Depends
from .middleware.auth import validate_user_access

router = APIRouter()

@router.get("/api/{user_id}/tasks")
async def list_tasks(
    user_id: str,
    validated_user: str = Depends(validate_user_access)
):
    # validated_user is guaranteed to match path user_id
    tasks = task_service.list_by_user(validated_user)
    return {"tasks": tasks, "count": len(tasks)}
```

---

## CORS Configuration

### Problem: Browser Blocks Cross-Origin Requests

When frontend (e.g., `localhost:3000`) calls backend (e.g., `localhost:8000`), browsers block the request without proper CORS headers.

### Solution: Configure CORS Middleware

**File**: `backend/src/main.py`

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os

app = FastAPI()

# CORS configuration
origins = [
    os.getenv("FRONTEND_URL", "http://localhost:3000"),
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)
```

### Environment Variables

```bash
# Backend .env
FRONTEND_URL=http://localhost:3000  # Development
# FRONTEND_URL=https://your-app.vercel.app  # Production
```

### CORS Headers Returned

```
Access-Control-Allow-Origin: http://localhost:3000
Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS
Access-Control-Allow-Headers: Authorization, Content-Type
Access-Control-Allow-Credentials: true
```

---

## Error Response Structure

### Standard Error Response Body

All error responses follow this structure:

```json
{
  "detail": "Human-readable error message"
}
```

### Authentication Error Responses

| Status | Detail | Cause |
|--------|--------|-------|
| 401 | "Not authenticated" | Missing Authorization header |
| 401 | "Invalid token" | Malformed or tampered token |
| 401 | "Token expired" | Token past expiration time |
| 401 | "Invalid token payload" | Token missing `sub` claim |
| 401 | "User ID mismatch" | Path user_id ≠ JWT sub |

### Frontend Error Handling

```typescript
// In api-client.ts or components
try {
  const response = await apiClient("/api/{user_id}/tasks");

  if (!response.ok) {
    const error = await response.json();

    switch (response.status) {
      case 401:
        // Redirect to login with message
        window.location.href = "/signin?error=session_expired";
        break;
      case 404:
        // Task not found or not owned
        toast.error("Task not found");
        break;
      case 400:
        // Validation error
        toast.error(error.detail || "Invalid request");
        break;
      default:
        toast.error("Something went wrong");
    }
  }
} catch (err) {
  // Network error
  toast.error("Unable to connect to server");
}
```

---

## Authentication

All endpoints require a valid JWT token in the Authorization header:

```
Authorization: Bearer <jwt_token>
```

**Authentication Flow**:
1. User signs in via Better Auth frontend
2. JWT token issued containing `user_id` in `sub` claim
3. Token attached to all API requests via `apiClient()`
4. Backend middleware verifies token using `BETTER_AUTH_SECRET`
5. `user_id` extracted and validated against path parameter
6. All database queries filtered by `user_id`

**Error Responses**:
- Missing token: `401 Unauthorized` with `{"detail": "Not authenticated"}`
- Invalid/expired token: `401 Unauthorized` with `{"detail": "Token expired"}` or `{"detail": "Invalid token"}`
- User ID mismatch: `401 Unauthorized` with `{"detail": "User ID mismatch"}`

---

## Base URL

```
/api/{user_id}/tasks
```

**Path Parameters**:
- `user_id` (UUID): The authenticated user's identifier (must match JWT `sub` claim)

**Security Note**: Backend validates that `user_id` in path matches the authenticated user's ID from JWT. Mismatches return `401 Unauthorized` with `{"detail": "User ID mismatch"}`.

---

## Query Parameter Validation

### Strict Validation Rules

All query parameters are validated strictly. Invalid values return `400 Bad Request`.

| Parameter | Valid Values | Default | Invalid Example |
|-----------|--------------|---------|-----------------|
| `status` | `completed`, `pending`, `all` | `all` | `done`, `active` |
| `sort` | `created_at`, `due_date`, `priority` | `created_at` | `date`, `title` |
| `order` | `asc`, `desc` | `desc` | `ascending`, `up` |

### Validation Error Response

```json
{
  "detail": "Invalid value for 'status': 'done'. Must be one of: completed, pending, all"
}
```

### Backend Validation Implementation

```python
from enum import Enum
from fastapi import Query, HTTPException

class TaskStatus(str, Enum):
    completed = "completed"
    pending = "pending"
    all = "all"

class SortField(str, Enum):
    created_at = "created_at"
    due_date = "due_date"
    priority = "priority"

class SortOrder(str, Enum):
    asc = "asc"
    desc = "desc"

@router.get("/api/{user_id}/tasks")
async def list_tasks(
    user_id: str,
    status: TaskStatus = Query(default=TaskStatus.all),
    sort: SortField = Query(default=SortField.created_at),
    order: SortOrder = Query(default=SortOrder.desc),
    validated_user: str = Depends(validate_user_access)
):
    # FastAPI automatically validates enum values
    # Invalid values return 422 Unprocessable Entity
    ...
```

---

## Pagination (Optional - Phase 3)

### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `page` | integer | No | 1 | Page number (1-indexed) |
| `limit` | integer | No | 50 | Items per page (max: 100) |

### Request Example

```http
GET /api/{user_id}/tasks?page=2&limit=20&status=pending
```

### Response with Pagination

```json
{
  "tasks": [...],
  "count": 20,
  "pagination": {
    "page": 2,
    "limit": 20,
    "total": 87,
    "total_pages": 5,
    "has_next": true,
    "has_prev": true
  }
}
```

**Note**: Pagination is optional for Phase 2. Current implementation returns all tasks (acceptable for <1000 tasks per user). Pagination should be implemented in Phase 3 for scalability.

---

## Endpoints

### 1. List Tasks

**GET** `/api/{user_id}/tasks`

Retrieve all tasks belonging to the authenticated user.

**Task Ownership Enforcement**: Query automatically filtered by `user_id` from JWT.

**Query Parameters**:

| Parameter | Type | Required | Valid Values | Default |
|-----------|------|----------|--------------|---------|
| `status` | string | No | `completed`, `pending`, `all` | `all` |
| `sort` | string | No | `created_at`, `due_date`, `priority` | `created_at` |
| `order` | string | No | `asc`, `desc` | `desc` |

**Request Example**:
```http
GET /api/550e8400-e29b-41d4-a716-446655440000/tasks?status=pending&sort=due_date&order=asc
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

**Response (200 OK)**:
```json
{
  "tasks": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "title": "Complete project documentation",
      "description": "Write API docs for Phase 2",
      "completed": false,
      "priority": "P1",
      "due_date": "2026-01-25",
      "created_at": "2026-01-19T10:30:00Z",
      "updated_at": "2026-01-19T10:30:00Z"
    },
    {
      "id": "987fcdeb-51a2-3c4d-e5f6-789012345678",
      "title": "Review authentication flow",
      "description": null,
      "completed": false,
      "priority": "P2",
      "due_date": null,
      "created_at": "2026-01-18T14:20:00Z",
      "updated_at": "2026-01-19T09:15:00Z"
    }
  ],
  "count": 2
}
```

**Error Responses**:
- `401 Unauthorized`: Invalid/missing JWT or user_id mismatch
- `400 Bad Request`: Invalid query parameter value

---

### 2. Get Single Task

**GET** `/api/{user_id}/tasks/{task_id}`

Retrieve a specific task by ID.

**Task Ownership Enforcement**: Query filtered by `user_id` AND `task_id`. Returns 404 if task doesn't exist OR belongs to another user.

**Path Parameters**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `user_id` | UUID | Yes | Authenticated user's ID |
| `task_id` | UUID | Yes | Task identifier |

**Request Example**:
```http
GET /api/550e8400-e29b-41d4-a716-446655440000/tasks/123e4567-e89b-12d3-a456-426614174000
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

**Response (200 OK)**:
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "title": "Complete project documentation",
  "description": "Write API docs for Phase 2",
  "completed": false,
  "priority": "P1",
  "due_date": "2026-01-25",
  "created_at": "2026-01-19T10:30:00Z",
  "updated_at": "2026-01-19T10:30:00Z"
}
```

**Error Responses**:
- `401 Unauthorized`: Invalid/missing JWT or user_id mismatch
- `404 Not Found`: Task does not exist OR belongs to another user (no distinction to prevent enumeration)

---

### 3. Create Task

**POST** `/api/{user_id}/tasks`

Create a new task for the authenticated user.

**Task Ownership Enforcement**: `user_id` automatically set from JWT `sub` claim. Cannot create tasks for other users.

**Request Body**:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | string | Yes | Task title (1-200 characters) |
| `description` | string | No | Task description |
| `priority` | string | No | Priority level: `P1`, `P2`, `P3` (default: `P2`) |
| `due_date` | string (ISO date) | No | Due date in YYYY-MM-DD format |

**Request Example**:
```http
POST /api/550e8400-e29b-41d4-a716-446655440000/tasks
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
Content-Type: application/json

{
  "title": "Implement user dashboard",
  "description": "Create the main dashboard view with task summary",
  "priority": "P1",
  "due_date": "2026-01-30"
}
```

**Response (201 Created)**:
```json
{
  "id": "abcdef12-3456-7890-abcd-ef1234567890",
  "title": "Implement user dashboard",
  "description": "Create the main dashboard view with task summary",
  "completed": false,
  "priority": "P1",
  "due_date": "2026-01-30",
  "created_at": "2026-01-19T15:45:00Z",
  "updated_at": "2026-01-19T15:45:00Z"
}
```

**Error Responses**:
- `401 Unauthorized`: Invalid/missing JWT or user_id mismatch
- `400 Bad Request`: Missing required fields, invalid data format, or title exceeds 200 characters

---

### 4. Update Task

**PUT** `/api/{user_id}/tasks/{task_id}`

Update all fields of an existing task (full replacement).

**Task Ownership Enforcement**: Query filtered by `user_id` AND `task_id`. Returns 404 if task doesn't exist OR belongs to another user.

**Path Parameters**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `user_id` | UUID | Yes | Authenticated user's ID |
| `task_id` | UUID | Yes | Task identifier |

**Request Body**:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | string | Yes | Task title (1-200 characters) |
| `description` | string | No | Task description (null to clear) |
| `completed` | boolean | Yes | Completion status |
| `priority` | string | No | Priority level: `P1`, `P2`, `P3` |
| `due_date` | string (ISO date) | No | Due date (null to clear) |

**Request Example**:
```http
PUT /api/550e8400-e29b-41d4-a716-446655440000/tasks/123e4567-e89b-12d3-a456-426614174000
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
Content-Type: application/json

{
  "title": "Complete project documentation - UPDATED",
  "description": "Write API docs for Phase 2 - revised scope",
  "completed": false,
  "priority": "P1",
  "due_date": "2026-01-28"
}
```

**Response (200 OK)**:
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "title": "Complete project documentation - UPDATED",
  "description": "Write API docs for Phase 2 - revised scope",
  "completed": false,
  "priority": "P1",
  "due_date": "2026-01-28",
  "created_at": "2026-01-19T10:30:00Z",
  "updated_at": "2026-01-19T16:00:00Z"
}
```

**Error Responses**:
- `401 Unauthorized`: Invalid/missing JWT or user_id mismatch
- `404 Not Found`: Task does not exist or belongs to another user
- `400 Bad Request`: Invalid data format or validation error

---

### 5. Partial Update Task

**PATCH** `/api/{user_id}/tasks/{task_id}`

Update specific fields of an existing task (partial update).

**Task Ownership Enforcement**: Query filtered by `user_id` AND `task_id`. Returns 404 if task doesn't exist OR belongs to another user.

**Path Parameters**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `user_id` | UUID | Yes | Authenticated user's ID |
| `task_id` | UUID | Yes | Task identifier |

**Request Body** (all fields optional):

| Field | Type | Description |
|-------|------|-------------|
| `title` | string | Task title (1-200 characters) |
| `description` | string | Task description |
| `completed` | boolean | Completion status |
| `priority` | string | Priority level: `P1`, `P2`, `P3` |
| `due_date` | string (ISO date) | Due date |

**Request Example** (toggle completion):
```http
PATCH /api/550e8400-e29b-41d4-a716-446655440000/tasks/123e4567-e89b-12d3-a456-426614174000
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
Content-Type: application/json

{
  "completed": true
}
```

**Response (200 OK)**:
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "title": "Complete project documentation",
  "description": "Write API docs for Phase 2",
  "completed": true,
  "priority": "P1",
  "due_date": "2026-01-25",
  "created_at": "2026-01-19T10:30:00Z",
  "updated_at": "2026-01-19T16:30:00Z"
}
```

**Error Responses**:
- `401 Unauthorized`: Invalid/missing JWT or user_id mismatch
- `404 Not Found`: Task does not exist or belongs to another user
- `400 Bad Request`: Invalid data format or validation error

---

### 6. Delete Task

**DELETE** `/api/{user_id}/tasks/{task_id}`

Permanently delete a task.

**Task Ownership Enforcement**: Query filtered by `user_id` AND `task_id`. Returns 404 if task doesn't exist OR belongs to another user.

**Path Parameters**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `user_id` | UUID | Yes | Authenticated user's ID |
| `task_id` | UUID | Yes | Task identifier |

**Request Example**:
```http
DELETE /api/550e8400-e29b-41d4-a716-446655440000/tasks/123e4567-e89b-12d3-a456-426614174000
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

**Response (204 No Content)**:
```
(empty body)
```

**Error Responses**:
- `401 Unauthorized`: Invalid/missing JWT or user_id mismatch
- `404 Not Found`: Task does not exist or belongs to another user

---

## Data Models

### Task Object

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Unique task identifier |
| `title` | string | Task title (1-200 chars) |
| `description` | string | Optional task description |
| `completed` | boolean | Completion status |
| `priority` | string | Priority: `P1`, `P2`, `P3` |
| `due_date` | string (ISO date) | Optional due date (YYYY-MM-DD) |
| `created_at` | string (ISO datetime) | Creation timestamp |
| `updated_at` | string (ISO datetime) | Last update timestamp |

### Error Object

| Field | Type | Description |
|-------|------|-------------|
| `detail` | string | Human-readable error message |

**Error Response Example**:
```json
{
  "detail": "Task not found"
}
```

---

## Error Codes Summary

| Status Code | Detail Message | Description | When Used |
|-------------|----------------|-------------|-----------|
| `200 OK` | - | Success | GET, PUT, PATCH |
| `201 Created` | - | Resource created | POST |
| `204 No Content` | - | Success, no body | DELETE |
| `400 Bad Request` | "Invalid value for '{param}': '{value}'" | Validation error | Invalid input, missing fields |
| `401 Unauthorized` | "Not authenticated" | Auth failure | Missing Authorization header |
| `401 Unauthorized` | "Invalid token" | Auth failure | Malformed/tampered JWT |
| `401 Unauthorized` | "Token expired" | Auth failure | JWT past expiration |
| `401 Unauthorized` | "User ID mismatch" | Auth failure | Path user_id ≠ JWT sub |
| `404 Not Found` | "Task not found" | Resource not found | Task not found or not owned |
| `422 Unprocessable Entity` | Validation errors | FastAPI validation | Invalid enum values |

---

## User Isolation

All endpoints enforce strict user isolation:

1. JWT token verified on every request
2. `user_id` extracted from JWT `sub` claim
3. Path `{user_id}` validated against JWT `user_id` (via `validate_user_access`)
4. All database queries filtered by `user_id`
5. Access to other users' tasks returns `404` (not `403`)

**Security Rationale**: Returning `404` instead of `403` for unauthorized access prevents task enumeration attacks.

**Implementation Checklist**:
- [ ] `get_current_user` dependency extracts and validates JWT
- [ ] `validate_user_access` dependency validates path user_id matches JWT
- [ ] All task queries include `WHERE user_id = :user_id`
- [ ] Task service methods require `user_id` parameter
- [ ] No endpoint allows accessing tasks without `user_id` filter

---

## Rate Limiting

### Phase 2 (Current)

- Authentication endpoints are rate-limited (see @specs/features/authentication/spec.md)
- Task CRUD endpoints do not have rate limiting

### Phase 3 (Recommended)

For Phase 3, implement rate limiting on task endpoints to prevent abuse:

| Endpoint | Limit | Window | Response |
|----------|-------|--------|----------|
| GET /tasks | 100 requests | 1 minute | 429 Too Many Requests |
| POST /tasks | 30 requests | 1 minute | 429 Too Many Requests |
| PUT/PATCH /tasks | 60 requests | 1 minute | 429 Too Many Requests |
| DELETE /tasks | 30 requests | 1 minute | 429 Too Many Requests |

**Rate Limit Response**:
```json
{
  "detail": "Rate limit exceeded. Try again in 45 seconds."
}
```

**Headers** (for client retry logic):
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1706198445
Retry-After: 45
```

---

## Common Issues & Solutions

### 401 Unauthorized on All Requests

**Cause**: Token not attached to requests
**Solution**: Use `apiClient()` from `lib/api-client.ts` for all API calls

### 401 User ID Mismatch

**Cause**: Path `user_id` doesn't match JWT `sub` claim
**Solution**: Ensure path user_id comes from authenticated session:
```typescript
const session = await authClient.getSession();
const userId = session.user.id;
const response = await apiClient(`/api/${userId}/tasks`);
```

### CORS Errors in Browser

**Cause**: Backend CORS not configured for frontend origin
**Solution**: Add frontend URL to CORS `allow_origins` list

### Tasks Not Saving

**Cause**: 401 error due to missing/invalid token
**Solution**: Check browser DevTools Network tab for actual error response

### Invalid Query Parameter

**Cause**: Using non-standard values (e.g., `status=done`)
**Solution**: Use only valid enum values from documentation

---

## Assumptions

- UUIDs are used for all identifiers (user_id, task_id)
- Timestamps are in ISO 8601 format with UTC timezone
- Priority defaults to `P2` if not specified
- Task titles are required and limited to 200 characters
- No pagination in Phase 2 (acceptable for <1000 tasks per user)
- JWT algorithm is HS256 with shared secret (`BETTER_AUTH_SECRET`)
- CORS configured for specific frontend origin (not `*`)
- Frontend uses `apiClient()` for all authenticated requests
- Backend validates both JWT and path user_id on every request

---

## Dependencies

- **Authentication**: @specs/features/authentication/spec.md - JWT verification, HS256 algorithm
- **Task CRUD**: @specs/features/task-crud/spec.md - Core task operations
- **Better Auth**: Frontend session management, token retrieval via `authClient.getSession()`
- **PyJWT**: Backend JWT verification with HS256 algorithm
- **FastAPI CORS Middleware**: Cross-origin request handling

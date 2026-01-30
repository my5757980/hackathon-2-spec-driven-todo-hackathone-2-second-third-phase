# Backend Guidelines

Guidelines for Claude Code when working on the FastAPI backend for the Phase 2 Todo application.

## Stack

- **FastAPI** - Modern async Python web framework
- **SQLModel** - ORM combining SQLAlchemy and Pydantic
- **Neon PostgreSQL** - Serverless PostgreSQL database
- **python-jose** or **PyJWT** - JWT token verification
- **Better Auth** - Authentication (frontend handles login; backend verifies JWT)

## Project Structure

```
backend/
├── main.py           # FastAPI app entry point, middleware setup
├── models.py         # SQLModel database models (User, Task)
├── schemas.py        # Pydantic request/response schemas
├── db.py             # Database connection and session management
├── auth.py           # JWT verification utilities
├── routes/
│   └── tasks.py      # Task CRUD endpoints
└── requirements.txt  # Python dependencies
```

## API Conventions

### URL Structure
- All routes under `/api/` prefix
- User-scoped routes: `/api/{user_id}/tasks`
- Task-specific routes: `/api/{user_id}/tasks/{task_id}`

### Request/Response
- Return JSON responses for all endpoints
- Use Pydantic models for request validation and response serialization
- Content-Type: `application/json`

### HTTP Methods
| Method | Purpose | Success Code |
|--------|---------|--------------|
| GET | Retrieve resource(s) | 200 OK |
| POST | Create resource | 201 Created |
| PUT | Full update | 200 OK |
| PATCH | Partial update | 200 OK |
| DELETE | Remove resource | 204 No Content |

### Error Handling
Use `HTTPException` for all errors:

```python
from fastapi import HTTPException

# Missing or invalid JWT
raise HTTPException(status_code=401, detail="Invalid or missing token")

# Resource not found (also used for unauthorized access to prevent enumeration)
raise HTTPException(status_code=404, detail="Task not found")

# Validation error
raise HTTPException(status_code=400, detail="Title is required")
```

## Database

### Connection
Use environment variable `DATABASE_URL` for Neon PostgreSQL connection:

```python
# db.py
import os
from sqlmodel import SQLModel, create_engine, Session

DATABASE_URL = os.getenv("DATABASE_URL")
engine = create_engine(DATABASE_URL, echo=True)

def get_session():
    with Session(engine) as session:
        yield session
```

### Models
Reference `@specs/database/schema.md` for complete schema. Key models:

```python
# models.py
from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime

class User(SQLModel, table=True):
    id: str = Field(primary_key=True)  # UUID from Better Auth
    email: str = Field(unique=True, index=True)

class Task(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    title: str = Field(max_length=255)
    description: Optional[str] = None
    completed: bool = Field(default=False, index=True)
    priority: str = Field(default="P2")  # P1, P2, P3
    due_date: Optional[str] = None  # YYYY-MM-DD format
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    user_id: str = Field(foreign_key="user.id", index=True)
```

### Indexes
Ensure indexes on:
- `tasks.user_id` - For user isolation queries
- `tasks.completed` - For status filtering

## JWT Verification

### Middleware Setup
Verify JWT from `Authorization: Bearer <token>` header using shared secret:

```python
# auth.py
import os
from jose import jwt, JWTError
from fastapi import HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

BETTER_AUTH_SECRET = os.getenv("BETTER_AUTH_SECRET")
security = HTTPBearer()

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)) -> str:
    """Verify JWT and return user_id from 'sub' claim."""
    token = credentials.credentials
    try:
        payload = jwt.decode(token, BETTER_AUTH_SECRET, algorithms=["HS256"])
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token: missing user_id")
        return user_id
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
```

### Dependency Injection
Use `Depends()` in route handlers:

```python
from fastapi import Depends
from auth import verify_token

@router.get("/api/{user_id}/tasks")
def list_tasks(user_id: str, auth_user_id: str = Depends(verify_token)):
    # Validate path user_id matches JWT user_id
    if user_id != auth_user_id:
        raise HTTPException(status_code=401, detail="Unauthorized")
    # ... proceed with query
```

## User Isolation

**Critical Security Requirement**: Users can only access their own tasks.

### Path Validation
Always validate that `{user_id}` in URL path matches the authenticated user's ID from JWT:

```python
if user_id != auth_user_id:
    raise HTTPException(status_code=401, detail="Unauthorized")
```

### Query Filtering
Always filter database queries by `user_id`:

```python
# Correct - always include user_id filter
tasks = session.exec(
    select(Task).where(Task.user_id == auth_user_id)
).all()

# For single task retrieval, filter by BOTH task_id AND user_id
task = session.exec(
    select(Task).where(Task.id == task_id, Task.user_id == auth_user_id)
).first()

if not task:
    # Return 404 (not 403) to prevent task enumeration
    raise HTTPException(status_code=404, detail="Task not found")
```

### Security Rationale
- Return `404 Not Found` instead of `403 Forbidden` when accessing other users' tasks
- This prevents attackers from enumerating valid task IDs

## Environment Variables

Required environment variables:

```bash
DATABASE_URL=postgresql://user:pass@host/database?sslmode=require
BETTER_AUTH_SECRET=your-shared-secret-with-frontend
```

Create `.env` file for local development (never commit to git):

```bash
# .env
DATABASE_URL=postgresql://...
BETTER_AUTH_SECRET=...
```

Load with python-dotenv:

```python
from dotenv import load_dotenv
load_dotenv()
```

## API Endpoints Reference

Full endpoint specifications: `@specs/api/rest-endpoints.md`

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/{user_id}/tasks` | GET | List all tasks (with optional filters) |
| `/api/{user_id}/tasks` | POST | Create a new task |
| `/api/{user_id}/tasks/{task_id}` | GET | Get single task |
| `/api/{user_id}/tasks/{task_id}` | PUT | Full update task |
| `/api/{user_id}/tasks/{task_id}` | PATCH | Partial update task |
| `/api/{user_id}/tasks/{task_id}` | DELETE | Delete task |

### Query Parameters (GET /tasks)
- `status`: Filter by `completed`, `pending`, `all` (default: `all`)
- `sort`: Sort by `created_at`, `due_date`, `priority` (default: `created_at`)
- `order`: Sort order `asc`, `desc` (default: `desc`)

## Running the Server

### Development
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### API Documentation
FastAPI auto-generates docs:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Best Practices

### Do
- Always use `Depends(verify_token)` on protected routes
- Always filter queries by `user_id`
- Return appropriate HTTP status codes
- Validate request data with Pydantic models
- Use `HTTPException` for error responses
- Keep database sessions scoped to request lifecycle

### Don't
- Never trust user input without validation
- Never expose internal errors to clients
- Never return `403` for other users' tasks (use `404`)
- Never hardcode secrets (use environment variables)
- Never skip JWT verification on any task endpoint

## Related Specs

- `@specs/api/rest-endpoints.md` - Complete REST API specification
- `@specs/database/schema.md` - Database models and relationships
- `@specs/features/authentication/spec.md` - Authentication flow details
- `@specs/features/task-crud/spec.md` - Task CRUD requirements

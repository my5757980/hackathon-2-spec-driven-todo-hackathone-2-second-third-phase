---
name: backend-jwt-middleware
description: Generate FastAPI JWT verification middleware and dependencies for Better Auth integration
version: 1.0.0
author: Spec-Driven Development
tags: [fastapi, jwt, python-jose, better-auth, authentication, middleware, dependencies]
libraries:
  fastapi: "^0.115.0"
  python-jose: "^3.3.0"
  better-auth: "^1.4.0 (frontend)"
---

# Backend JWT Middleware Skill

Generate FastAPI JWT verification middleware and dependencies that validate Bearer tokens from Better Auth, extract user identity, and protect API routes with ownership enforcement.

## When to Use This Skill

Use this skill when you need to:

- Protect FastAPI endpoints with JWT authentication
- Verify tokens issued by Better Auth (frontend)
- Extract `user_id` from JWT `sub` claim for ownership filtering
- Implement dependency injection pattern for current user
- Handle 401 Unauthorized responses for invalid/expired tokens
- Filter database queries by authenticated user (multi-tenancy)

## Prerequisites

- FastAPI 0.115+ backend
- Better Auth configured on frontend with Bearer plugin
- Shared secret (`BETTER_AUTH_SECRET`) between frontend and backend
- python-jose installed for JWT operations

## Step-by-Step Process

### Step 1: Install Dependencies

```bash
pip install python-jose[cryptography] fastapi
```

Or add to `requirements.txt` / `pyproject.toml`:

```
python-jose[cryptography]>=3.3.0
fastapi>=0.115.0
```

### Step 2: Configure Environment Variables

```bash
# .env
BETTER_AUTH_SECRET=your-shared-secret-from-better-auth
JWT_ALGORITHM=HS256
```

### Step 3: Create Auth Dependencies Module

Create the main authentication module at `backend/dependencies/auth.py`:

```python
# backend/dependencies/auth.py
"""
JWT Authentication Dependencies for FastAPI + Better Auth Integration

This module provides:
- JWT token verification using python-jose
- User ID extraction from token claims
- FastAPI dependency injection for protected routes
- Ownership enforcement helpers for multi-tenant queries
"""

import os
from typing import Annotated, Optional
from datetime import datetime, timezone

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, ExpiredSignatureError, JWTError, JWTClaimsError
from pydantic import BaseModel

# =============================================================================
# Configuration
# =============================================================================

# Shared secret with Better Auth frontend
BETTER_AUTH_SECRET = os.getenv("BETTER_AUTH_SECRET")
if not BETTER_AUTH_SECRET:
    raise ValueError("BETTER_AUTH_SECRET environment variable is required")

# JWT Algorithm - Better Auth uses HS256 by default
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")

# Token URL for OpenAPI docs (points to Better Auth endpoint)
TOKEN_URL = os.getenv("TOKEN_URL", "/api/auth/token")

# =============================================================================
# OAuth2 Scheme
# =============================================================================

# OAuth2PasswordBearer extracts token from Authorization: Bearer <token> header
oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl=TOKEN_URL,
    auto_error=True,  # Automatically raise 401 if no token
)

# Optional scheme for endpoints that work with or without auth
oauth2_scheme_optional = OAuth2PasswordBearer(
    tokenUrl=TOKEN_URL,
    auto_error=False,  # Return None if no token
)

# =============================================================================
# Token Data Models
# =============================================================================

class TokenPayload(BaseModel):
    """Decoded JWT token payload from Better Auth"""
    sub: str  # User ID (subject claim)
    exp: Optional[int] = None  # Expiration timestamp
    iat: Optional[int] = None  # Issued at timestamp
    iss: Optional[str] = None  # Issuer
    aud: Optional[str] = None  # Audience
    # Add additional Better Auth claims as needed
    email: Optional[str] = None
    name: Optional[str] = None


class CurrentUser(BaseModel):
    """Current authenticated user context"""
    user_id: str
    email: Optional[str] = None
    name: Optional[str] = None

    class Config:
        frozen = True  # Make immutable


# =============================================================================
# Token Verification
# =============================================================================

def verify_token(token: str) -> TokenPayload:
    """
    Verify and decode a JWT token.

    Args:
        token: The JWT token string (without 'Bearer ' prefix)

    Returns:
        TokenPayload with decoded claims

    Raises:
        HTTPException(401): If token is invalid, expired, or malformed
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        # Decode and verify the JWT
        payload = jwt.decode(
            token,
            BETTER_AUTH_SECRET,
            algorithms=[JWT_ALGORITHM],
            options={
                "verify_signature": True,
                "verify_exp": True,
                "verify_iat": True,
                "require_exp": True,
                "leeway": 10,  # 10 seconds leeway for clock skew
            }
        )

        # Extract subject (user_id) - required claim
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception

        # Build token payload model
        return TokenPayload(
            sub=user_id,
            exp=payload.get("exp"),
            iat=payload.get("iat"),
            iss=payload.get("iss"),
            aud=payload.get("aud"),
            email=payload.get("email"),
            name=payload.get("name"),
        )

    except ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except JWTClaimsError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid token claims: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except JWTError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid token: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )


# =============================================================================
# FastAPI Dependencies
# =============================================================================

async def get_current_user(
    token: Annotated[str, Depends(oauth2_scheme)]
) -> CurrentUser:
    """
    FastAPI dependency that extracts and validates the current user from JWT.

    Usage:
        @router.get("/protected")
        async def protected_route(current_user: CurrentUser = Depends(get_current_user)):
            return {"user_id": current_user.user_id}

    Args:
        token: JWT token extracted from Authorization header by OAuth2PasswordBearer

    Returns:
        CurrentUser with user_id and optional profile info

    Raises:
        HTTPException(401): If token is missing, invalid, or expired
    """
    token_data = verify_token(token)

    return CurrentUser(
        user_id=token_data.sub,
        email=token_data.email,
        name=token_data.name,
    )


async def get_current_user_optional(
    token: Annotated[Optional[str], Depends(oauth2_scheme_optional)]
) -> Optional[CurrentUser]:
    """
    FastAPI dependency for optional authentication.
    Returns CurrentUser if valid token present, None otherwise.

    Usage:
        @router.get("/public-or-private")
        async def mixed_route(current_user: Optional[CurrentUser] = Depends(get_current_user_optional)):
            if current_user:
                return {"message": f"Hello {current_user.user_id}"}
            return {"message": "Hello guest"}
    """
    if token is None:
        return None

    try:
        token_data = verify_token(token)
        return CurrentUser(
            user_id=token_data.sub,
            email=token_data.email,
            name=token_data.name,
        )
    except HTTPException:
        return None


def get_user_id(
    current_user: Annotated[CurrentUser, Depends(get_current_user)]
) -> str:
    """
    Convenience dependency that returns just the user_id string.

    Usage:
        @router.get("/tasks")
        async def list_tasks(user_id: str = Depends(get_user_id)):
            return await task_service.get_tasks_by_owner(user_id)
    """
    return current_user.user_id


# =============================================================================
# Type Aliases for Clean Route Signatures
# =============================================================================

# Use these for cleaner route signatures
AuthenticatedUser = Annotated[CurrentUser, Depends(get_current_user)]
OptionalUser = Annotated[Optional[CurrentUser], Depends(get_current_user_optional)]
UserId = Annotated[str, Depends(get_user_id)]


# =============================================================================
# Ownership Enforcement Helpers
# =============================================================================

def require_ownership(resource_owner_id: str, current_user_id: str) -> None:
    """
    Verify that the current user owns the resource.

    Usage:
        task = await task_repo.get(task_id)
        require_ownership(task.owner_id, current_user.user_id)

    Raises:
        HTTPException(403): If user doesn't own the resource
        HTTPException(404): Intentionally not used to avoid leaking existence
    """
    if resource_owner_id != current_user_id:
        # Return 403 Forbidden for ownership violations
        # Some prefer 404 to avoid leaking resource existence
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this resource",
        )


class OwnershipChecker:
    """
    Reusable ownership checker for a specific resource type.

    Usage:
        task_ownership = OwnershipChecker("task")

        @router.get("/tasks/{task_id}")
        async def get_task(task_id: str, user: AuthenticatedUser):
            task = await task_repo.get(task_id)
            task_ownership.check(task.owner_id, user.user_id)
            return task
    """

    def __init__(self, resource_name: str = "resource"):
        self.resource_name = resource_name

    def check(self, owner_id: str, user_id: str) -> None:
        """Check ownership, raise 403 if unauthorized"""
        if owner_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Not authorized to access this {self.resource_name}",
            )


# =============================================================================
# Export Public Interface
# =============================================================================

__all__ = [
    # Dependencies
    "get_current_user",
    "get_current_user_optional",
    "get_user_id",
    # Type aliases
    "AuthenticatedUser",
    "OptionalUser",
    "UserId",
    # Models
    "CurrentUser",
    "TokenPayload",
    # Ownership helpers
    "require_ownership",
    "OwnershipChecker",
    # Schemes (for advanced use)
    "oauth2_scheme",
    "oauth2_scheme_optional",
    # Functions
    "verify_token",
]
```

### Step 4: Create Config Module (Optional)

For cleaner configuration management:

```python
# backend/core/config.py
from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    """Application settings loaded from environment"""

    # JWT/Auth
    better_auth_secret: str
    jwt_algorithm: str = "HS256"
    token_url: str = "/api/auth/token"

    # Database
    database_url: str = "sqlite:///./todo.db"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


@lru_cache
def get_settings() -> Settings:
    return Settings()
```

Then update `auth.py` to use settings:

```python
from backend.core.config import get_settings

settings = get_settings()
BETTER_AUTH_SECRET = settings.better_auth_secret
JWT_ALGORITHM = settings.jwt_algorithm
```

### Step 5: Usage in Routes

#### Basic Protected Route

```python
# backend/routers/tasks.py
from fastapi import APIRouter, Depends, HTTPException, status
from backend.dependencies.auth import AuthenticatedUser, UserId, require_ownership

router = APIRouter(prefix="/api/tasks", tags=["tasks"])


@router.get("")
async def list_tasks(user_id: UserId):
    """List all tasks for the authenticated user"""
    # user_id is automatically extracted from JWT
    tasks = await task_service.get_tasks_by_owner(user_id)
    return tasks


@router.post("")
async def create_task(task_data: TaskCreate, current_user: AuthenticatedUser):
    """Create a new task for the authenticated user"""
    task = await task_service.create_task(
        title=task_data.title,
        owner_id=current_user.user_id,
    )
    return task


@router.get("/{task_id}")
async def get_task(task_id: str, current_user: AuthenticatedUser):
    """Get a specific task (ownership enforced)"""
    task = await task_service.get_task(task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    # Enforce ownership
    require_ownership(task.owner_id, current_user.user_id)
    return task


@router.delete("/{task_id}")
async def delete_task(task_id: str, current_user: AuthenticatedUser):
    """Delete a task (ownership enforced)"""
    task = await task_service.get_task(task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    require_ownership(task.owner_id, current_user.user_id)
    await task_service.delete_task(task_id)
    return {"deleted": True}
```

#### Mixed Public/Private Route

```python
from backend.dependencies.auth import OptionalUser

@router.get("/public/{task_id}")
async def get_public_task(task_id: str, current_user: OptionalUser):
    """Get task - shows more details if authenticated"""
    task = await task_service.get_task(task_id)

    if current_user and task.owner_id == current_user.user_id:
        # Owner sees full details
        return {"task": task, "is_owner": True}
    elif task.is_public:
        # Public task, limited details
        return {"task": task.public_view(), "is_owner": False}
    else:
        raise HTTPException(status_code=404, detail="Task not found")
```

### Step 6: Database Query Filtering

Always filter queries by `owner_id` for multi-tenant data isolation:

```python
# backend/repositories/task_repository.py
from sqlmodel import Session, select
from backend.models.task import Task


class TaskRepository:
    def __init__(self, session: Session):
        self.session = session

    def get_by_owner(self, owner_id: str) -> list[Task]:
        """Get all tasks for a specific owner"""
        statement = select(Task).where(Task.owner_id == owner_id)
        return self.session.exec(statement).all()

    def get_one(self, task_id: str, owner_id: str) -> Task | None:
        """Get a task by ID, filtered by owner"""
        statement = select(Task).where(
            Task.id == task_id,
            Task.owner_id == owner_id  # Always filter by owner!
        )
        return self.session.exec(statement).first()

    def create(self, task: Task, owner_id: str) -> Task:
        """Create a task with owner assignment"""
        task.owner_id = owner_id  # Always set owner!
        self.session.add(task)
        self.session.commit()
        self.session.refresh(task)
        return task
```

## Output Format

When invoking this skill, the output will be:

1. **Primary file**: `backend/dependencies/auth.py` - JWT verification and dependencies
2. **Optional files**:
   - `backend/core/config.py` - Settings management
   - `backend/repositories/*.py` - Repository patterns with ownership filtering

## Configuration Options

| Environment Variable | Default | Description |
|---------------------|---------|-------------|
| `BETTER_AUTH_SECRET` | Required | Shared secret with Better Auth frontend |
| `JWT_ALGORITHM` | `HS256` | JWT signing algorithm |
| `TOKEN_URL` | `/api/auth/token` | Token endpoint for OpenAPI docs |

## Key Patterns Implemented

1. **OAuth2PasswordBearer**: Extracts Bearer token from Authorization header
2. **Dependency Injection**: `get_current_user` injects authenticated user into routes
3. **Token Verification**: python-jose with proper error handling (expired, invalid, malformed)
4. **Type Aliases**: `AuthenticatedUser`, `UserId` for clean route signatures
5. **Ownership Enforcement**: `require_ownership()` helper and `OwnershipChecker` class
6. **Optional Auth**: `get_current_user_optional` for mixed public/private routes
7. **Multi-Tenant Filtering**: All queries filtered by `owner_id`

## Library Versions Used

| Library | Version | Notes |
|---------|---------|-------|
| FastAPI | ^0.115.0 | OAuth2PasswordBearer, Depends, HTTPException |
| python-jose | ^3.3.0 | JWT decode with HS256, error handling |
| Better Auth | ^1.4.0 | Frontend token issuer with Bearer plugin |
| Pydantic | ^2.0.0 | Token and user models |

## Error Responses

| Status | Condition | Detail |
|--------|-----------|--------|
| 401 | Missing token | "Not authenticated" |
| 401 | Invalid token | "Could not validate credentials" |
| 401 | Expired token | "Token has expired" |
| 401 | Invalid claims | "Invalid token claims: {details}" |
| 403 | Not owner | "Not authorized to access this resource" |

## Testing Checklist

- [ ] Valid token returns user_id correctly
- [ ] Expired token returns 401
- [ ] Invalid signature returns 401
- [ ] Missing token returns 401
- [ ] Wrong owner returns 403
- [ ] Optional auth returns None for missing token
- [ ] OpenAPI docs show lock icon on protected routes
- [ ] Database queries always filter by owner_id

## Security Considerations

1. **Never log tokens** - Avoid printing JWT contents to logs
2. **Use HTTPS** - Tokens in headers must be encrypted in transit
3. **Short expiry** - Configure Better Auth for short-lived tokens
4. **Rotate secrets** - Plan for secret rotation without downtime
5. **Validate all claims** - Don't trust client-provided data
6. **403 vs 404** - Consider returning 404 to avoid leaking resource existence

## Related Skills

- `frontend-jwt-client` - Next.js API client with token attachment
- `better-auth-setup` - Better Auth initial configuration
- `fastapi-sqlmodel-crud` - SQLModel CRUD with ownership patterns

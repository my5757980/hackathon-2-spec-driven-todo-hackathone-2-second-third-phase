# Generated from @specs/features/authentication/spec.md
"""Authentication dependency for route injection.

Provides a FastAPI dependency that extracts and validates the user_id
from a verified JWT token. Use this dependency in route handlers that
require authentication.
"""

from typing import Annotated

from fastapi import Depends, HTTPException, Request, Path

from middleware.jwt_auth import jwt_bearer


async def get_current_user_id(
    user_id_from_token: Annotated[str, Depends(jwt_bearer)],
) -> str:
    """Get the current authenticated user's ID.

    This dependency verifies the JWT token and extracts the user_id
    from the 'sub' claim. Use it in routes that require authentication.

    Args:
        user_id_from_token: User ID extracted from JWT by jwt_bearer.

    Returns:
        The authenticated user's ID (UUID string).

    Raises:
        HTTPException: 401 if token is invalid or missing.
    """
    return user_id_from_token


async def verify_user_access(
    user_id: Annotated[str, Path(description="User ID from URL path")],
    current_user_id: Annotated[str, Depends(get_current_user_id)],
) -> str:
    """Verify that the authenticated user matches the path user_id.

    This dependency ensures that users can only access their own resources.
    It validates that the user_id in the URL path matches the authenticated
    user's ID from the JWT token.

    Args:
        user_id: User ID from the URL path parameter.
        current_user_id: Authenticated user's ID from JWT.

    Returns:
        The verified user_id.

    Raises:
        HTTPException: 401 if path user_id doesn't match authenticated user.
    """
    if user_id != current_user_id:
        raise HTTPException(
            status_code=401,
            detail="Unauthorized"
        )
    return user_id


# Type aliases for cleaner route signatures
CurrentUserId = Annotated[str, Depends(get_current_user_id)]
VerifiedUserId = Annotated[str, Depends(verify_user_access)]

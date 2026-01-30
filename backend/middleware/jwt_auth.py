# Generated from @specs/features/authentication/spec.md
"""JWT verification middleware for FastAPI.

Verifies JWT tokens from the Authorization header using HS256 symmetric
verification with the shared BETTER_AUTH_SECRET.

Updated: 2026-01-29
- Changed to prioritize HS256 verification (matches frontend jwt generation)
- Removed JWKS fetch to avoid "relation jwks does not exist" errors
- JWKS/RS256 only used if explicitly configured

Extracts user_id from the 'sub' claim.
"""

import os
import time
import httpx
from typing import Optional, Dict, Any
from datetime import datetime, timezone

from jose import jwt, JWTError, ExpiredSignatureError
from jose.backends import RSAKey, ECKey
from fastapi import HTTPException, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from services.auth_logger import auth_logger

# Configuration from environment
BETTER_AUTH_SECRET = os.getenv("BETTER_AUTH_SECRET")
# Default to HS256 - the frontend generates HS256 tokens via jose
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
BETTER_AUTH_URL = os.getenv("BETTER_AUTH_URL", "http://localhost:3000")
# Set to true to enable JWKS/RS256 verification (default: false to avoid jwks table errors)
USE_JWKS = os.getenv("USE_JWKS", "false").lower() == "true"

# JWKS cache (only used if USE_JWKS is true)
_jwks_cache: Dict[str, Any] = {}
_jwks_cache_time: float = 0
JWKS_CACHE_TTL = 3600  # 1 hour


async def get_jwks() -> Dict[str, Any]:
    """Fetch JWKS from Better Auth endpoint with caching.

    Returns:
        The JWKS (JSON Web Key Set) dictionary.
    """
    global _jwks_cache, _jwks_cache_time

    # Return cached JWKS if still valid
    if _jwks_cache and (time.time() - _jwks_cache_time) < JWKS_CACHE_TTL:
        return _jwks_cache

    try:
        jwks_url = f"{BETTER_AUTH_URL}/api/auth/jwks"
        print(f"[JWT Auth] Fetching JWKS from: {jwks_url}")

        async with httpx.AsyncClient() as client:
            response = await client.get(jwks_url, timeout=10.0)

            if response.status_code == 200:
                _jwks_cache = response.json()
                _jwks_cache_time = time.time()
                print(f"[JWT Auth] JWKS fetched successfully: {len(_jwks_cache.get('keys', []))} keys")
                return _jwks_cache
            else:
                print(f"[JWT Auth] JWKS endpoint returned {response.status_code}")
                return {}
    except Exception as e:
        print(f"[JWT Auth] Failed to fetch JWKS: {e}")
        return {}


def get_signing_key_from_jwks(jwks: Dict[str, Any], kid: str = None) -> Optional[Dict]:
    """Get the signing key from JWKS by key ID.

    Args:
        jwks: The JWKS dictionary.
        kid: The key ID to look for (optional).

    Returns:
        The matching key dictionary, or the first key if no kid specified.
    """
    keys = jwks.get("keys", [])
    if not keys:
        return None

    if kid:
        for key in keys:
            if key.get("kid") == kid:
                return key

    # Return the first key if no kid specified
    return keys[0] if keys else None


class JWTBearer(HTTPBearer):
    """Custom HTTPBearer that verifies JWT tokens.

    Supports both asymmetric (JWKS) and symmetric (shared secret) verification.
    """

    def __init__(self, auto_error: bool = True):
        super().__init__(auto_error=auto_error)

    async def __call__(self, request: Request) -> Optional[str]:
        """Extract and verify JWT from Authorization header.

        Returns:
            The verified user_id from the token's 'sub' claim.

        Raises:
            HTTPException: 401 if token is missing, invalid, or expired.
        """
        credentials: HTTPAuthorizationCredentials = await super().__call__(request)

        if not credentials:
            auth_logger.log_auth_failure(
                event="token_missing",
                email=None,
                reason="No authorization header provided",
                ip_address=request.client.host if request.client else None
            )
            raise HTTPException(
                status_code=401,
                detail="Invalid or missing token"
            )

        if credentials.scheme.lower() != "bearer":
            auth_logger.log_auth_failure(
                event="invalid_scheme",
                email=None,
                reason=f"Invalid auth scheme: {credentials.scheme}",
                ip_address=request.client.host if request.client else None
            )
            raise HTTPException(
                status_code=401,
                detail="Invalid or missing token"
            )

        user_id = await self.verify_jwt(credentials.credentials, request)
        return user_id

    async def verify_jwt(self, token: str, request: Request) -> str:
        """Verify JWT token and extract user_id.

        By default, verifies using HS256 symmetric algorithm with BETTER_AUTH_SECRET.
        This matches the frontend's jwt generation using jose.

        JWKS verification is only attempted if USE_JWKS=true and token uses
        an asymmetric algorithm.

        Args:
            token: The JWT token string.
            request: The FastAPI request object.

        Returns:
            The user_id from the token's 'sub' claim.

        Raises:
            HTTPException: 401 if token is invalid or expired.
        """
        ip_address = request.client.host if request.client else None

        # Try to decode token header to get algorithm and key ID
        try:
            unverified_headers = jwt.get_unverified_headers(token)
            alg = unverified_headers.get("alg", "HS256")
            kid = unverified_headers.get("kid")
            print(f"[JWT Auth] Token algorithm: {alg}, key ID: {kid}")
        except JWTError as e:
            print(f"[JWT Auth] Failed to decode token headers: {e}")
            auth_logger.log_auth_failure(
                event="invalid_token",
                email=None,
                reason=f"Failed to decode token headers: {str(e)}",
                ip_address=ip_address
            )
            raise HTTPException(
                status_code=401,
                detail="Invalid or missing token"
            )

        # For HS256 (default), verify immediately with shared secret
        if alg == "HS256":
            return await self._verify_hs256(token, ip_address)

        # Try JWKS verification for asymmetric algorithms only if USE_JWKS is enabled
        if USE_JWKS and alg in ["EdDSA", "ES256", "ES512", "RS256", "PS256"]:
            print(f"[JWT Auth] Attempting JWKS verification for algorithm: {alg}")
            jwks = await get_jwks()
            if jwks:
                signing_key = get_signing_key_from_jwks(jwks, kid)
                if signing_key:
                    try:
                        print(f"[JWT Auth] Verifying with JWKS key")
                        payload = jwt.decode(
                            token,
                            signing_key,
                            algorithms=[alg],
                            audience=BETTER_AUTH_URL,  # ⬅️ ADD
                            issuer=BETTER_AUTH_URL,    # ⬅️ ADD
                            options={
                                "verify_exp": True,
                                "verify_signature": True,
                                "verify_aud": True,    # ⬅️ ADD
                                "verify_iss": True,    # ⬅️ ADD
                                "require_exp": True,
                            }
                        )
                        return self._extract_user_id(payload, ip_address)
                    except ExpiredSignatureError:
                        auth_logger.log_auth_failure(
                            event="token_expired",
                            email=None,
                            reason="Token has expired",
                            ip_address=ip_address
                        )
                        raise HTTPException(
                            status_code=401,
                            detail="Token expired"
                        )
                    except JWTError as e:
                        print(f"[JWT Auth] JWKS verification failed: {e}")
                        # Fall through to HS256 as last resort

        # Fall back to HS256 verification for any algorithm if JWKS failed
        print(f"[JWT Auth] Falling back to HS256 verification")
        return await self._verify_hs256(token, ip_address)

    async def _verify_hs256(self, token: str, ip_address: Optional[str]) -> str:
        """Verify token using HS256 symmetric algorithm.

        Args:
            token: The JWT token string.
            ip_address: Client IP address for logging.

        Returns:
            The user_id from the token's 'sub' claim.

        Raises:
            HTTPException: 401 if token is invalid or expired.
        """
        if not BETTER_AUTH_SECRET:
            print("[JWT Auth] No BETTER_AUTH_SECRET configured")
            raise HTTPException(
                status_code=500,
                detail="Server configuration error"
            )

        try:
            print(f"[JWT Auth] Verifying with symmetric key (HS256)")
            payload = jwt.decode(
                token,
                BETTER_AUTH_SECRET,
                algorithms=["HS256"],
                audience=BETTER_AUTH_URL,  # ⬅️ YEH ADD KARO
                issuer=BETTER_AUTH_URL,    # ⬅️ YEH BHI ADD KARO
                options={
                    "verify_exp": True,
                    "verify_signature": True,
                    "verify_aud": True,    # ⬅️ YEH BHI
                    "verify_iss": True,    # ⬅️ YEH BHI
                    "require_exp": True,
                }
            )
            return self._extract_user_id(payload, ip_address)

        except ExpiredSignatureError:
            auth_logger.log_auth_failure(
                event="token_expired",
                email=None,
                reason="Token has expired",
                ip_address=ip_address
            )
            raise HTTPException(
                status_code=401,
                detail="Token expired"
            )

        except JWTError as e:
            auth_logger.log_auth_failure(
                event="invalid_token",
                email=None,
                reason=f"JWT verification failed: {str(e)}",
                ip_address=ip_address
            )
            raise HTTPException(
                status_code=401,
                detail="Invalid token"
            )

    def _extract_user_id(self, payload: Dict, ip_address: Optional[str]) -> str:
        """Extract user_id from JWT payload.

        Args:
            payload: The decoded JWT payload.
            ip_address: Client IP address for logging.

        Returns:
            The user_id from the 'sub' claim.

        Raises:
            HTTPException: 401 if user_id is missing.
        """
        user_id = payload.get("sub")
        if not user_id:
            auth_logger.log_auth_failure(
                event="invalid_token",
                email=None,
                reason="Token missing 'sub' claim",
                ip_address=ip_address
            )
            raise HTTPException(
                status_code=401,
                detail="Invalid or missing token"
            )

        print(f"[JWT Auth] Token verified successfully, user_id: {user_id}")
        return user_id


# Singleton instance for use as dependency
jwt_bearer = JWTBearer()

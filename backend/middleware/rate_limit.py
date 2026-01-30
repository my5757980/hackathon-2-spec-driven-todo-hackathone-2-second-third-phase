# Generated from @specs/features/authentication/spec.md
"""Rate limiting middleware for authentication endpoints.

Implements in-memory rate limiting with 5 failed attempts per 15 minutes
per IP/email combination.
"""

import time
from typing import Optional
from collections import defaultdict
from dataclasses import dataclass, field
from threading import Lock

from fastapi import HTTPException, Request

from services.auth_logger import auth_logger


@dataclass
class RateLimitEntry:
    """Track rate limit attempts for a key."""
    attempts: int = 0
    first_attempt_time: float = field(default_factory=time.time)


class RateLimiter:
    """In-memory rate limiter for authentication endpoints.

    Limits failed authentication attempts to prevent brute force attacks.
    Uses IP + email combination as the rate limit key.
    """

    def __init__(
        self,
        max_attempts: int = 5,
        window_seconds: int = 900,  # 15 minutes
    ):
        """Initialize rate limiter.

        Args:
            max_attempts: Maximum allowed attempts within the window.
            window_seconds: Time window in seconds (default: 15 minutes).
        """
        self.max_attempts = max_attempts
        self.window_seconds = window_seconds
        self._entries: dict[str, RateLimitEntry] = defaultdict(RateLimitEntry)
        self._lock = Lock()

    def _get_key(self, ip_address: Optional[str], email: Optional[str]) -> str:
        """Generate rate limit key from IP and email."""
        ip = ip_address or "unknown"
        mail = email.lower() if email else "unknown"
        return f"{ip}:{mail}"

    def _cleanup_expired(self) -> None:
        """Remove expired entries from the cache."""
        current_time = time.time()
        expired_keys = [
            key for key, entry in self._entries.items()
            if current_time - entry.first_attempt_time > self.window_seconds
        ]
        for key in expired_keys:
            del self._entries[key]

    def check_rate_limit(
        self,
        ip_address: Optional[str] = None,
        email: Optional[str] = None,
    ) -> None:
        """Check if the IP/email combination is rate limited.

        Args:
            ip_address: Client IP address.
            email: Email address being used for authentication.

        Raises:
            HTTPException: 429 if rate limit exceeded.
        """
        key = self._get_key(ip_address, email)

        with self._lock:
            self._cleanup_expired()
            entry = self._entries.get(key)

            if entry:
                current_time = time.time()
                time_elapsed = current_time - entry.first_attempt_time

                # Reset if window has passed
                if time_elapsed > self.window_seconds:
                    del self._entries[key]
                    return

                # Check if rate limited
                if entry.attempts >= self.max_attempts:
                    remaining_seconds = int(self.window_seconds - time_elapsed)
                    auth_logger.log_rate_limit(
                        email=email,
                        ip_address=ip_address,
                        attempts=entry.attempts,
                    )
                    raise HTTPException(
                        status_code=429,
                        detail=f"Too many requests. Try again in {remaining_seconds} seconds."
                    )

    def record_attempt(
        self,
        ip_address: Optional[str] = None,
        email: Optional[str] = None,
        success: bool = False,
    ) -> None:
        """Record an authentication attempt.

        Args:
            ip_address: Client IP address.
            email: Email address used for authentication.
            success: Whether the attempt was successful.
        """
        # Only track failed attempts
        if success:
            # On success, clear the rate limit for this key
            key = self._get_key(ip_address, email)
            with self._lock:
                if key in self._entries:
                    del self._entries[key]
            return

        key = self._get_key(ip_address, email)

        with self._lock:
            self._cleanup_expired()
            entry = self._entries.get(key)

            if entry:
                current_time = time.time()
                if current_time - entry.first_attempt_time > self.window_seconds:
                    # Reset window
                    self._entries[key] = RateLimitEntry(
                        attempts=1,
                        first_attempt_time=current_time,
                    )
                else:
                    entry.attempts += 1
            else:
                self._entries[key] = RateLimitEntry(
                    attempts=1,
                    first_attempt_time=time.time(),
                )

    def get_remaining_attempts(
        self,
        ip_address: Optional[str] = None,
        email: Optional[str] = None,
    ) -> int:
        """Get remaining attempts for an IP/email combination.

        Args:
            ip_address: Client IP address.
            email: Email address.

        Returns:
            Number of remaining attempts.
        """
        key = self._get_key(ip_address, email)

        with self._lock:
            entry = self._entries.get(key)
            if not entry:
                return self.max_attempts

            current_time = time.time()
            if current_time - entry.first_attempt_time > self.window_seconds:
                return self.max_attempts

            return max(0, self.max_attempts - entry.attempts)


# Singleton instance for auth endpoints
auth_rate_limiter = RateLimiter(max_attempts=5, window_seconds=900)

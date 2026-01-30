# Generated from @specs/features/authentication/spec.md
"""Security audit logging service for authentication events.

Logs all authentication attempts (signup, signin, signout) with structured
JSON output. Follows security best practices:
- Never logs passwords or full tokens
- Masks sensitive data
- Includes timestamp, email, outcome, and failure reason
"""

import json
import logging
from datetime import datetime, timezone
from typing import Optional

# Configure logger
logger = logging.getLogger("auth_security")
logger.setLevel(logging.INFO)

# Create console handler with JSON formatter
handler = logging.StreamHandler()
handler.setLevel(logging.INFO)
logger.addHandler(handler)


class AuthLogger:
    """Structured JSON logger for authentication events."""

    @staticmethod
    def _mask_token(token: Optional[str]) -> Optional[str]:
        """Mask JWT token for logging (show first 10 and last 5 chars)."""
        if not token or len(token) < 20:
            return "[MASKED]"
        return f"{token[:10]}...{token[-5:]}"

    @staticmethod
    def _mask_email(email: Optional[str]) -> Optional[str]:
        """Mask email for logging (show first 2 chars and domain)."""
        if not email or "@" not in email:
            return email
        local, domain = email.split("@", 1)
        if len(local) <= 2:
            return f"{local[0]}*@{domain}"
        return f"{local[:2]}{'*' * (len(local) - 2)}@{domain}"

    def _log(self, event_data: dict) -> None:
        """Write structured JSON log entry."""
        event_data["timestamp"] = datetime.now(timezone.utc).isoformat()
        event_data["service"] = "auth"
        logger.info(json.dumps(event_data, default=str))

    def log_signup_attempt(
        self,
        email: str,
        success: bool,
        user_id: Optional[str] = None,
        reason: Optional[str] = None,
        ip_address: Optional[str] = None,
    ) -> None:
        """Log a signup attempt.

        Args:
            email: The email address used for signup.
            success: Whether the signup was successful.
            user_id: The created user's ID (if successful).
            reason: Failure reason (if unsuccessful).
            ip_address: Client IP address.
        """
        self._log({
            "event": "signup",
            "email": self._mask_email(email),
            "success": success,
            "user_id": user_id if success else None,
            "reason": reason if not success else None,
            "ip_address": ip_address,
        })

    def log_signin_attempt(
        self,
        email: str,
        success: bool,
        user_id: Optional[str] = None,
        reason: Optional[str] = None,
        ip_address: Optional[str] = None,
    ) -> None:
        """Log a signin attempt.

        Args:
            email: The email address used for signin.
            success: Whether the signin was successful.
            user_id: The user's ID (if successful).
            reason: Failure reason (if unsuccessful).
            ip_address: Client IP address.
        """
        self._log({
            "event": "signin",
            "email": self._mask_email(email),
            "success": success,
            "user_id": user_id if success else None,
            "reason": reason if not success else None,
            "ip_address": ip_address,
        })

    def log_signout(
        self,
        user_id: str,
        email: Optional[str] = None,
        ip_address: Optional[str] = None,
    ) -> None:
        """Log a signout event.

        Args:
            user_id: The user's ID.
            email: The user's email address.
            ip_address: Client IP address.
        """
        self._log({
            "event": "signout",
            "user_id": user_id,
            "email": self._mask_email(email) if email else None,
            "success": True,
            "ip_address": ip_address,
        })

    def log_auth_failure(
        self,
        event: str,
        email: Optional[str] = None,
        reason: Optional[str] = None,
        ip_address: Optional[str] = None,
    ) -> None:
        """Log an authentication failure.

        Args:
            event: Type of failure (token_expired, invalid_token, etc.).
            email: The email address (if available).
            reason: Detailed failure reason.
            ip_address: Client IP address.
        """
        self._log({
            "event": event,
            "email": self._mask_email(email) if email else None,
            "success": False,
            "reason": reason,
            "ip_address": ip_address,
        })

    def log_rate_limit(
        self,
        email: Optional[str] = None,
        ip_address: Optional[str] = None,
        attempts: int = 0,
    ) -> None:
        """Log a rate limit event.

        Args:
            email: The email address being rate limited.
            ip_address: The IP address being rate limited.
            attempts: Number of attempts made.
        """
        self._log({
            "event": "rate_limited",
            "email": self._mask_email(email) if email else None,
            "success": False,
            "reason": f"Rate limit exceeded ({attempts} attempts)",
            "ip_address": ip_address,
        })


# Singleton instance
auth_logger = AuthLogger()

# Research: Authentication (Phase 2)

**Feature**: Authentication
**Created**: 2026-01-19
**Updated**: 2026-01-26

## Research Summary

All technical unknowns have been resolved through documentation research and implementation experience.

---

## 1. Better Auth JWT Plugin (Updated 2026-01-26)

**Decision**: Use Better Auth's jwt plugin with HS256 algorithm

**Critical Finding**: Better Auth defaults to RS256 which requires a JWKS table. To avoid `"relation jwks does not exist"` error, **force HS256 mode**.

**Implementation**:
```typescript
import { betterAuth } from "better-auth";
import { jwt } from "better-auth/plugins";

export const auth = betterAuth({
  plugins: [
    jwt({
      jwt: {
        definePayload: ({ user }) => ({
          sub: user.id,
          email: user.email,
        }),
      },
    }),
  ],
});
```

**Token Retrieval**:
- Use `authClient.getSession()` which returns `{ session: { token: "ey..." }, user: { ... } }`
- NOT `authClient.token()` as previously documented

**Alternatives Considered**:
- RS256 (default): Rejected - requires JWKS table
- Custom JWT generation: Rejected - violates "no custom auth" constraint

**Source**: Implementation experience + Better Auth documentation

---

## 2. Database Adapter Setup (NEW 2026-01-26)

**Decision**: Use pg Pool adapter with DATABASE_URL

**Critical Finding**: Without database adapter, users are NOT persisted after signup. Signup appears to succeed but user doesn't exist.

**Implementation**:
```typescript
import { Pool } from "pg";
import { betterAuth } from "better-auth";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const auth = betterAuth({
  database: pool,
  // ... other config
});
```

**Required Tables** (must exist before first signup):
1. `user` - User accounts
2. `session` - Active sessions
3. `account` - Provider accounts (stores password for email/password)
4. `verification` - Email verification tokens

**Source**: Implementation experience

---

## 3. FastAPI JWT Verification Library (Updated 2026-01-26)

**Decision**: Use `PyJWT` library (changed from python-jose)

**Rationale**:
- Simpler API
- Matches spec code examples
- Sufficient for HS256 verification
- Actively maintained

**Usage Pattern**:
```python
import jwt
import os

def verify_token(token: str) -> dict:
    return jwt.decode(
        token,
        key=os.getenv("BETTER_AUTH_SECRET"),
        algorithms=["HS256"]  # MUST match frontend
    )
```

**Error Handling**:
```python
from jwt.exceptions import ExpiredSignatureError, InvalidTokenError

try:
    decoded = verify_token(token)
    user_id = decoded.get('sub')
except ExpiredSignatureError:
    raise HTTPException(status_code=401, detail="Token expired")
except InvalidTokenError:
    raise HTTPException(status_code=401, detail="Invalid token")
```

**Alternatives Considered**:
- `python-jose`: More complex, less active development
- `joserfc`: Newer but less ecosystem adoption

**Source**: Implementation experience + PyJWT documentation

---

## 4. JWT Token Structure

**Decision**: Use standard JWT claims with `sub` for user_id

**Token Payload Structure**:
```json
{
  "sub": "uuid-user-id",
  "email": "user@example.com",
  "exp": 1234567890,
  "iat": 1234560000
}
```

**Notes**:
- `sub` is the standard claim for user identification (JWT RFC 7519)
- `email` included for convenience
- Backend extracts `user_id` from `sub` claim

---

## 5. Shared Secret Best Practices

**Decision**: 256-bit minimum secret, HS256 algorithm, MUST BE IDENTICAL

**Critical Finding**: Mismatched secrets cause 401 errors even with valid sessions.

**Checklist**:
- [ ] Secret is at least 32 characters
- [ ] Generated securely: `openssl rand -base64 32`
- [ ] IDENTICAL value in frontend `.env.local` and backend `.env`
- [ ] Not committed to version control
- [ ] Environment variable name: `BETTER_AUTH_SECRET`

**Source**: Implementation experience

---

## 6. Token Attachment to API Calls (NEW 2026-01-26)

**Decision**: Create reusable API client that automatically attaches token

**Critical Finding**: Without explicit token attachment, all protected backend routes return 401.

**Implementation**:
```typescript
// lib/api-client.ts
import { authClient } from "./auth-client";

export async function apiClient(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  const session = await authClient.getSession();

  if (!session?.session?.token) {
    throw new Error("Not authenticated");
  }

  const headers = new Headers(options.headers);
  headers.set("Authorization", `Bearer ${session.session.token}`);
  headers.set("Content-Type", "application/json");

  return fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, {
    ...options,
    headers,
  });
}
```

**Source**: Implementation experience

---

## 7. Client vs Server Components (NEW 2026-01-26)

**Decision**: Strict separation based on component type

**Critical Finding**: Using wrong auth API in wrong component type causes runtime errors.

| Location | Use | Import |
|----------|-----|--------|
| Server Component | `auth.api.getSession({ headers: await headers() })` | `@/lib/auth` |
| Client Component | `authClient.signIn/signUp/signOut/getSession()` | `@/lib/auth-client` |
| Server redirect | `redirect("/signin")` | `next/navigation` |
| Client redirect | `router.push("/signin")` | `next/navigation` |

**Common Mistakes**:
- Using `authClient` in server component → Runtime error
- Using `auth.api.getSession` in client component → Cannot access headers
- Using `useRouter()` in server component → Hooks only work in client
- Not awaiting `headers()` → Next.js 15 requires await

**Source**: Implementation experience + Next.js documentation

---

## 8. Token Storage Mechanism

**Decision**: Use Better Auth default (httpOnly cookies)

**How It Works**:
- Cookie name: `better-auth.session_token`
- HttpOnly: Yes (XSS protected)
- Secure: Yes in production
- SameSite: Lax

**Token Access**:
- `authClient.getSession()` returns the token
- Token must be explicitly attached for cross-origin API calls

**Source**: Better Auth documentation

---

## 9. Rate Limiting Pattern

**Decision**: Deferred to future iteration (optional for MVP)

**Rationale**:
- Spec marks as "optional for MVP"
- Simpler initial implementation
- Can add in-memory or Redis later

**Future Implementation Pattern**:
```python
from collections import defaultdict
from datetime import datetime, timedelta

rate_limits = defaultdict(list)

def check_rate_limit(key: str, max_attempts: int = 5, window_minutes: int = 15) -> bool:
    now = datetime.utcnow()
    cutoff = now - timedelta(minutes=window_minutes)
    rate_limits[key] = [t for t in rate_limits[key] if t > cutoff]
    if len(rate_limits[key]) >= max_attempts:
        return False  # Rate limited
    rate_limits[key].append(now)
    return True
```

---

## Open Questions (All Resolved)

| Question | Resolution |
|----------|------------|
| How to configure JWT algorithm? | Force HS256 via jwt plugin |
| How to persist users? | pg Pool adapter required |
| What tables are needed? | user, session, account, verification |
| How to attach token to API calls? | Reusable apiClient with getSession() |
| Client vs server auth methods? | Strict separation (see section 7) |
| What library for backend JWT? | PyJWT (simpler than python-jose) |
| Where to store tokens? | Better Auth default (httpOnly cookie) |
| How to handle rate limiting? | Deferred (optional for MVP) |

---

## References

- [Better Auth Documentation](https://www.better-auth.com/docs)
- [Better Auth JWT Plugin](https://www.better-auth.com/docs/plugins/jwt)
- [PyJWT Documentation](https://pyjwt.readthedocs.io/)
- [Next.js App Router Auth Patterns](https://nextjs.org/docs/app/building-your-application/authentication)

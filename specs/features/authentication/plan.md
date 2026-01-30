# Implementation Plan: Authentication (Phase 2 - Better Auth + JWT)

**Feature**: Authentication
**Phase**: 2 (Full-Stack Web Application)
**Created**: 2026-01-19
**Updated**: 2026-01-26
**Spec Reference**: @specs/features/authentication/spec.md

## Changes Summary (2026-01-26)

- Updated JWT library recommendation: PyJWT (simpler, matches spec examples)
- Added explicit HS256 configuration (avoid JWKS table error)
- Added pg Pool adapter setup for Better Auth
- Added required database tables (user, session, account, verification)
- Added API client pattern for token attachment
- Added client vs server component guidelines
- Added environment variables checklist
- Updated research section with implementation lessons

---

## Architecture Sketch

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              FRONTEND (Next.js)                              │
│  ┌─────────────────┐    ┌──────────────────────────────────────────────┐    │
│  │ lib/auth.ts     │    │ Better Auth Instance (Server)                │    │
│  │ - betterAuth()  │───▶│ - pg Pool adapter (DATABASE_URL)             │    │
│  │ - jwt plugin    │    │ - emailAndPassword: enabled                  │    │
│  │ - HS256 mode    │    │ - session.cookieCache: enabled               │    │
│  └─────────────────┘    └──────────────────────────────────────────────┘    │
│           │                                                                  │
│           ▼                                                                  │
│  ┌─────────────────┐    ┌──────────────────────────────────────────────┐    │
│  │ app/api/auth/   │    │ Auth API Routes                              │    │
│  │ [...all]/route  │───▶│ POST /api/auth/sign-up                       │    │
│  │                 │    │ POST /api/auth/sign-in                       │    │
│  │                 │    │ POST /api/auth/sign-out                      │    │
│  │                 │    │ GET  /api/auth/session                       │    │
│  └─────────────────┘    └──────────────────────────────────────────────┘    │
│           │                                                                  │
│           ▼                                                                  │
│  ┌─────────────────┐    ┌──────────────────────────────────────────────┐    │
│  │ lib/auth-client │    │ Auth Client (Client Components)              │    │
│  │ createAuthClient│───▶│ - signUp.email({ email, password, name })    │    │
│  │                 │    │ - signIn.email({ email, password })          │    │
│  │                 │    │ - signOut()                                  │    │
│  │                 │    │ - getSession() → { session: { token } }      │    │
│  └─────────────────┘    └──────────────────────────────────────────────┘    │
│           │                                                                  │
│           ▼                                                                  │
│  ┌─────────────────┐    ┌──────────────────────────────────────────────┐    │
│  │ lib/api-client  │    │ API Client with Token Attachment             │    │
│  │ apiClient()     │───▶│ - Gets token from authClient.getSession()    │    │
│  │                 │    │ - Attaches: Authorization: Bearer <token>    │    │
│  │                 │    │ - Calls NEXT_PUBLIC_API_URL endpoints        │    │
│  └─────────────────┘    └──────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      │ HTTPS + Authorization: Bearer <jwt>
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              BACKEND (FastAPI)                               │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │                         JWT Middleware (PyJWT)                       │   │
│  │  1. Extract token from Authorization header                          │   │
│  │  2. jwt.decode(token, BETTER_AUTH_SECRET, algorithms=["HS256"])     │   │
│  │  3. Validate expiration (exp claim)                                  │   │
│  │  4. Extract user_id from 'sub' claim                                 │   │
│  │  5. Return 401 if invalid/missing/expired                            │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                      │                                       │
│                                      ▼                                       │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │                         Task Service                                  │   │
│  │  - All queries filtered by user_id                                   │   │
│  │  - Create: auto-assign user_id from request                          │   │
│  │  - Read/Update/Delete: verify ownership or return 404                │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                      │                                       │
│                                      ▼                                       │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │                         PostgreSQL (Neon)                             │   │
│  │  user(id, name, email, email_verified, image, created_at, updated_at)│   │
│  │  session(id, user_id, token, expires_at, ip_address, user_agent, ...)│   │
│  │  account(id, user_id, account_id, provider_id, password, ...)        │   │
│  │  verification(id, identifier, value, expires_at, ...)                │   │
│  │  task(id, title, ..., user_id FK → user.id)                          │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Section Structure

### Files to Create

**Frontend (Next.js)**:
- `frontend/lib/auth.ts` - Better Auth server instance with pg Pool + JWT plugin (HS256)
- `frontend/lib/auth-client.ts` - Client-side auth client (createAuthClient)
- `frontend/lib/api-client.ts` - API client with automatic token attachment
- `frontend/lib/auth-errors.ts` - Error code to user message mapping
- `frontend/app/api/auth/[...all]/route.ts` - Better Auth catch-all route handler
- `frontend/app/(auth)/signin/page.tsx` - Sign in page (client component)
- `frontend/app/(auth)/signup/page.tsx` - Sign up page (client component)
- `frontend/app/(auth)/layout.tsx` - Auth pages layout
- `frontend/app/(protected)/layout.tsx` - Protected layout with session check (server)
- `frontend/app/(protected)/dashboard/page.tsx` - Dashboard page
- `frontend/components/auth/signin-form.tsx` - Sign in form ("use client")
- `frontend/components/auth/signup-form.tsx` - Sign up form ("use client")
- `frontend/components/auth/signout-button.tsx` - Sign out button ("use client")

**Backend (FastAPI)**:
- `backend/src/api/middleware/auth.py` - JWT verification dependency (PyJWT + HS256)
- `backend/src/services/auth_logger.py` - Security audit logging service

**Database**:
- `database/migrations/001_auth_tables.sql` - Create user, session, account, verification tables
- `database/migrations/002_task_user_id.sql` - Add user_id to task table

### Files to Modify

**Backend**:
- `backend/src/models/task.py` - Add `user_id` foreign key field
- `backend/src/services/task_service.py` - Filter all queries by user_id
- `backend/src/api/routes/tasks.py` - Add auth dependency, inject user_id
- `backend/src/core/config.py` - Add BETTER_AUTH_SECRET loading
- `backend/.env.example` - Add `BETTER_AUTH_SECRET`

**Frontend**:
- `frontend/.env.example` - Add `DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `NEXT_PUBLIC_API_URL`

## Research Findings (Implementation Lessons)

### Better Auth JWT Configuration (Critical)

**Problem**: Better Auth defaults to RS256 which requires JWKS table.
**Error**: `"relation jwks does not exist"`

**Solution**: Force HS256 mode with jwt plugin:
```typescript
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

### Database Adapter (Critical)

**Problem**: Without pg Pool adapter, users are not persisted after signup.
**Error**: Signup succeeds but user doesn't exist in database.

**Solution**: Configure pg Pool adapter:
```typescript
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const auth = betterAuth({
  database: pool,
  // ... other config
});
```

### Token Attachment (Critical)

**Problem**: JWT token not automatically attached to API calls.
**Error**: 401 Unauthorized on all protected backend routes.

**Solution**: Create reusable API client:
```typescript
export async function apiClient(endpoint: string, options: RequestInit = {}) {
  const session = await authClient.getSession();
  if (!session?.session?.token) throw new Error("Not authenticated");

  const headers = new Headers(options.headers);
  headers.set("Authorization", `Bearer ${session.session.token}`);

  return fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, { ...options, headers });
}
```

### Required Tables (Critical)

**Problem**: Tables must exist before first signup attempt.
**Error**: Database errors on signup.

**Solution**: Run migrations first:
```sql
CREATE TABLE IF NOT EXISTS "user" (
  id TEXT PRIMARY KEY,
  name TEXT,
  email TEXT UNIQUE NOT NULL,
  email_verified BOOLEAN DEFAULT FALSE,
  image TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "session" (...);
CREATE TABLE IF NOT EXISTS "account" (...);
CREATE TABLE IF NOT EXISTS "verification" (...);
```

### Client vs Server Components (Important)

**Problem**: Runtime errors from using wrong auth API in wrong component type.

**Solution**:
| Location | Use | Import |
|----------|-----|--------|
| Server Component | `auth.api.getSession({ headers: await headers() })` | from `@/lib/auth` |
| Client Component | `authClient.signIn/signUp/signOut/getSession()` | from `@/lib/auth-client` |
| Protected Layout (Server) | `auth.api.getSession` + `redirect()` | from `next/navigation` |
| Auth Forms (Client) | `authClient` + `useRouter().push()` | from `next/navigation` |

### BETTER_AUTH_SECRET Sync (Critical)

**Problem**: Mismatched secret causes invalid token errors.
**Error**: 401 Unauthorized even with valid session.

**Solution**:
1. Generate once: `openssl rand -base64 32`
2. Copy exact same value to frontend `.env.local` AND backend `.env`
3. Never regenerate without invalidating all sessions

## Quality Validation

### JWT Configuration Checklist
- [ ] jwt plugin imported from `better-auth/plugins`
- [ ] definePayload returns `{ sub: user.id, email: user.email }`
- [ ] Backend uses `algorithms=["HS256"]` (not RS256)
- [ ] Backend secret from `BETTER_AUTH_SECRET` env var

### Database Checklist
- [ ] pg Pool created with `DATABASE_URL`
- [ ] Pool passed to `betterAuth({ database: pool })`
- [ ] All 4 tables exist: user, session, account, verification
- [ ] task table has user_id foreign key

### Token Attachment Checklist
- [ ] apiClient function created in `lib/api-client.ts`
- [ ] Uses `authClient.getSession()` to get token
- [ ] Sets `Authorization: Bearer ${token}` header
- [ ] Used for all backend API calls

### Environment Variables Checklist
- [ ] `BETTER_AUTH_SECRET` ≥32 characters
- [ ] `BETTER_AUTH_SECRET` identical in frontend and backend
- [ ] `DATABASE_URL` valid PostgreSQL connection string
- [ ] `NEXT_PUBLIC_API_URL` points to backend
- [ ] `BETTER_AUTH_URL` equals frontend URL

### Component Pattern Checklist
- [ ] Auth forms have `"use client"` directive
- [ ] Protected layouts use server-side session check
- [ ] Sign out button is client component
- [ ] Redirects use `router.push()` (client) or `redirect()` (server)

## Decisions Documentation

### 1. JWT Library (Backend)

| Option | Pros | Cons |
|--------|------|------|
| python-jose | FastAPI docs reference | Older, less active |
| **PyJWT** (Selected) | Simpler API, matches spec examples | Less features |
| joserfc | Newest, active | Less ecosystem adoption |

**Decision**: PyJWT - simpler API, matches spec code examples, sufficient for HS256 verification.

### 2. JWT Algorithm

| Option | Pros | Cons |
|--------|------|------|
| RS256 | Public key verification | Requires JWKS table |
| **HS256** (Selected) | No JWKS table, simpler | Shared secret |

**Decision**: HS256 - avoids JWKS table requirement, sufficient for single-backend architecture.

### 3. Token Storage

| Option | Pros | Cons |
|--------|------|------|
| **Better Auth default** (Selected) | Handles automatically | Less explicit control |
| Manual localStorage | Full control | XSS vulnerable |

**Decision**: Use Better Auth's default httpOnly cookie mechanism.

### 4. JWT Expiry Duration

| Option | Pros | Cons |
|--------|------|------|
| 24h (Constitution) | More secure | Frequent re-auth |
| **7 days** (Spec override) | Better UX | Longer exposure |

**Decision**: 7 days (spec override documented, acceptable for MVP without token refresh).

### 5. Rate Limiting

| Option | Pros | Cons |
|--------|------|------|
| **Deferred to future** | Simpler MVP | Less secure |
| In-memory dict | Simple | Not distributed |

**Decision**: Defer rate limiting - marked as "optional for MVP" in spec.

## Testing Strategy

### Unit Tests

| Test | File | Acceptance Criteria |
|------|------|---------------------|
| JWT decode valid token | `test_auth_middleware.py` | Valid token extracts user_id |
| JWT decode expired token | `test_auth_middleware.py` | Returns 401 |
| JWT decode invalid signature | `test_auth_middleware.py` | Returns 401 |
| JWT decode missing token | `test_auth_middleware.py` | Returns 401 |
| Error parsing function | `auth-errors.test.ts` | Maps codes to messages |

### Integration Tests

| Test | Acceptance Criteria |
|------|---------------------|
| Signup creates user + session | User persisted in database |
| Signin returns session token | Token can be used for API calls |
| Token attached to API call | Backend receives Authorization header |
| User isolation | User A cannot see User B tasks |
| Signout clears session | Subsequent API calls return 401 |

## Implementation Phases

### Phase A: Environment & Database Setup
1. Add environment variables to `.env.example` files
2. Create and run database migrations (4 auth tables + task extension)
3. Verify tables exist in Neon console

### Phase B: Frontend Auth Instance
1. Install `better-auth`, `pg` dependencies
2. Create `lib/auth.ts` with pg Pool + jwt plugin (HS256)
3. Create `lib/auth-client.ts` for client components
4. Create `app/api/auth/[...all]/route.ts` catch-all handler
5. Test: Can call `/api/auth/session`

### Phase C: Auth UI Components
1. Create signin/signup forms (client components)
2. Create signout button
3. Create auth layout
4. Implement redirect logic after signin/signup
5. Create error parsing utility
6. Test: Full signup → signin → signout flow works

### Phase D: Token Attachment & Protected Routes
1. Create `lib/api-client.ts` with token attachment
2. Create protected layout with server-side session check
3. Test: Dashboard redirects to signin when not authenticated

### Phase E: Backend JWT Middleware
1. Install `pyjwt` dependency
2. Create auth middleware dependency (HS256 verification)
3. Load `BETTER_AUTH_SECRET` in config
4. Test: Endpoint with auth dependency returns 401 without token

### Phase F: User Isolation
1. Add `user_id` to Task model
2. Run migration for task table
3. Update task service to filter by user_id
4. Update task routes to use auth dependency
5. Test: User A cannot see User B tasks

### Phase G: Testing & Validation
1. Write unit tests for JWT middleware
2. Run through implementation checklist
3. Verify all environment variables

## Constitution Compliance Check

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Spec-Driven Development | ✅ | All code generated from spec |
| II. Iterative Refinement | ✅ | Spec updated with implementation lessons |
| III. Reusability & Modularity | ✅ | Auth middleware decoupled from task service |
| IV. Phase-wise Progression | ✅ | Builds on Phase 1 |
| V. Traceability | ✅ | Plan references spec |
| VI. Clean & Testable Code | ✅ | Testing strategy defined |
| VII. Security & Best Practices | ⚠️ | JWT expiry 7 days (spec override documented) |
| VIII. Documentation-First | ✅ | Spec and plan before implementation |
| IX. Performance & Scalability | ✅ | 100 concurrent users target |
| X. Error Handling & Observability | ✅ | Error code mapping defined |

## Risk Mitigation

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| BETTER_AUTH_SECRET mismatch | Medium | High | Checklist in spec, verify step |
| Missing auth tables | Medium | High | Migration scripts, verify step |
| Token not attached | High | High | Reusable apiClient pattern |
| Client/server component confusion | Medium | Medium | Clear file organization, guidelines |
| Better Auth API changes | Low | Medium | Pin version in package.json |

## Next Steps

1. ✅ Plan updated with implementation lessons
2. Run `/sp.tasks` to generate task breakdown
3. Create feature branch `002-authentication`
4. Execute phases A through G in order

---

**ADR Candidates**:
- HS256 vs RS256 JWT algorithm selection
- JWT expiry 7 days vs Constitution 24h requirement

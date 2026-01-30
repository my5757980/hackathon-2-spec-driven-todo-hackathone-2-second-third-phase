---
id: 007
title: Fix Signup 422 Field Mapping
stage: green
date: 2026-01-24
surface: agent
model: claude-opus-4-5-20251101
feature: authentication
branch: 002-page-layouts
user: maira
command: /sp.implement
labels: ["bugfix", "better-auth", "database", "signup"]
links:
  spec: specs/features/authentication/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - frontend/lib/auth.ts
tests:
  - curl -X POST http://localhost:3000/api/auth/sign-up/email (manual test)
---

## Prompt

@specs/features/authentication/tasks.md
@specs/database/schema.md
@specs/api/rest-endpoints.md
backend-import-crash-and-signup-422

Two main issues in the project:

Issue 1: Backend crash on startup (import errors / reload loop)
- tasks.py imports db.py → db.py uses create_async_engine → crashes if DATABASE_URL not loaded
- main.py imports routes.tasks → circular / early import before load_dotenv()
- Error: RuntimeError or ModuleNotFoundError on asyncpg / env vars

Issue 2: Frontend signup fails ("Failed to create user")
- 422 Unprocessable Entity on /api/auth/sign-up/email
- Better Auth frontend has no database adapter or wrong endpoint (calling backend instead of self)
- Console: "Unable to add filesystem: <illegal path>" (Better Auth adapter error)

Project context:
- FastAPI backend (localhost:8000) with SQLModel + asyncpg + Neon DB
- Next.js frontend (localhost:3000) with Better Auth client
- DATABASE_URL and BETTER_AUTH_SECRET in backend/.env
- Better Auth endpoints should be /api/auth/* (mounted in main.py)

Fix step-by-step:
1. Fix backend env load order — move load_dotenv() to very first line in main.py (before any import that uses env)
2. Add try/except in db.py to handle missing DATABASE_URL gracefully
3. Ensure Better Auth router is mounted correctly in main.py (prefix="/api/auth")
4. Add CORS middleware in main.py (allow localhost:3000)
5. Fix frontend Better Auth setup — use self-hosted mode (no backend proxy for auth) or correct endpoint
6. Add PostgreSQL adapter in frontend/lib/auth.ts using pg Pool + process.env.DATABASE_URL
7. Add better error logging in frontend signup handler (console.log response)
8. Test commands: curl POST to /api/auth/sign-up/email, check Swagger /docs
9. Commit messages for each fix

## Response snapshot

### Root Cause Analysis

**Issue 1 (Backend crash)**: Already fixed - `load_dotenv()` was correctly at the top of `main.py` before imports.

**Issue 2 (Signup 422)**: Column name mismatch between Better Auth expectations and database schema.

- Better Auth expected camelCase column names: `emailVerified`, `createdAt`, `updatedAt`, `userId`, etc.
- Migration script created snake_case columns: `email_verified`, `created_at`, `updated_at`, `user_id`, etc.
- Error: `column "emailVerified" of relation "user" does not exist`

### Fix Applied

Updated `frontend/lib/auth.ts` to add field mappings from camelCase to snake_case:

```typescript
export const auth = betterAuth({
  // ... existing config ...

  // Map field names to snake_case database columns (PostgreSQL convention)
  user: {
    fields: {
      emailVerified: 'email_verified',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  },
  session: {
    fields: {
      expiresAt: 'expires_at',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      userId: 'user_id',
      ipAddress: 'ip_address',
      userAgent: 'user_agent',
    },
  },
  account: {
    fields: {
      accountId: 'account_id',
      providerId: 'provider_id',
      userId: 'user_id',
      // ... etc
    },
  },
})
```

### Verification

- Backend health: `{"status":"healthy"}` ✓
- Signup test: `{"token":"...", "user":{"name":"Test User 3","email":"test3@example.com",...}}` ✓

## Outcome

- ✅ Impact: Signup now works correctly, users can register and authenticate
- 🧪 Tests: Manual curl test passed - signup returns 200 with token and user data
- 📁 Files: 1 file modified (frontend/lib/auth.ts)
- 🔁 Next prompts: Test signin flow, protected routes, JWT verification in backend
- 🧠 Reflection: Better Auth documentation uses Drizzle examples that show the mapping pattern but it's easy to miss. Always check actual database column names vs ORM expectations.

## Evaluation notes (flywheel)

- Failure modes observed: Snake_case vs camelCase column naming mismatch between migration and ORM
- Graders run and results (PASS/FAIL): Manual test PASS
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): Add automated integration test for signup flow

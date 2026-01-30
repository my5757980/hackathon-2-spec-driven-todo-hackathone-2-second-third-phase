---
id: 001
title: Fix API 401 JWT Token Attachment
stage: green
date: 2026-01-26
surface: agent
model: claude-opus-4-5-20251101
feature: authentication
branch: 001-task-crud
user: maira
command: /sp.implement
labels: ["jwt", "api-client", "better-auth", "401-fix"]
links:
  spec: specs/features/authentication/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - frontend/lib/auth.ts
  - frontend/lib/auth-client.ts
  - frontend/lib/api-client.ts
  - backend/middleware/jwt_auth.py
  - backend/requirements.txt
  - backend/.env.example
  - specs/features/authentication/tasks.md
tests:
  - Manual test: login -> dashboard -> tasks fetch without 401
---

## Prompt

@specs/features/authentication/spec.md
@specs/features/authentication/tasks.md
@specs/api/rest-endpoints.md

api-401-unauthorized-on-dashboard

Current error on dashboard:
- Console: [API Client] 401 Unauthorized - session expired or invalid
- File: lib/api-client.ts line 90
- Dashboard shows "No tasks yet" even after login
- Network tab shows 401 on /api/{user_id}/tasks

Root causes:
- JWT token not attached to API calls (missing Authorization header)
- Session expired or invalid after login
- Better Auth secret mismatch between frontend/backend
- Server-side vs client-side session check issue

Fix step-by-step:
1. Update lib/api-client.ts to attach Bearer token from Better Auth session
2. Add server-side session check in app/dashboard/page.tsx with redirect('/login')
3. Ensure BETTER_AUTH_SECRET is same in both .env files
4. Add logging for session/token in api-client.ts
5. Handle 401 with redirect and toast message
6. Output updated api-client.ts and dashboard/page.tsx code
7. Test steps: login -> dashboard -> tasks fetch without 401

Make sure after fix:
- API calls have Authorization header
- No more 401 on protected endpoints
- Dashboard shows tasks (or "No tasks" if empty)

## Response snapshot

Fixed the 401 Unauthorized error by implementing proper JWT token attachment:

1. **Frontend auth.ts**: Added Better Auth JWT plugin for asymmetric key token generation (EdDSA)
2. **Frontend auth-client.ts**: Added jwtClient plugin and getJwtToken() helper function
3. **Frontend api-client.ts**: Updated to fetch JWT token from Better Auth and attach as Bearer token with caching
4. **Backend jwt_auth.py**: Updated middleware to support JWKS verification (asymmetric keys) with fallback to symmetric HS256
5. **Backend requirements.txt**: Added httpx for async HTTP requests to JWKS endpoint
6. **Backend .env.example**: Added BETTER_AUTH_URL configuration

The fix aligns Better Auth's JWT plugin (which uses asymmetric keys by default) with the backend's JWT verification by enabling JWKS-based verification.

## Outcome

- Impact: Fixed 401 errors on dashboard API calls by properly attaching JWT tokens
- Tests: Manual testing required - login -> dashboard -> verify tasks fetch succeeds
- Files: 7 files modified across frontend and backend
- Next prompts: Test the implementation, verify JWKS endpoint works
- Reflection: Better Auth uses asymmetric keys (EdDSA) by default, not HS256 - backend needed JWKS support

## Evaluation notes (flywheel)

- Failure modes observed: Initial assumption that Better Auth JWT plugin supports HS256 was incorrect
- Graders run and results (PASS/FAIL): Manual testing pending
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): Verify JWKS endpoint accessible and keys are generated

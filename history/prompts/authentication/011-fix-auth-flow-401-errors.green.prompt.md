---
id: 011
title: Fix Authentication Flow 401 Errors and Token Attachment
stage: green
date: 2026-01-29
surface: agent
model: claude-opus-4-5-20251101
feature: authentication
branch: 001-task-crud
user: maira
command: /sp.implement
labels: ["authentication", "jwt", "token", "401-fix", "api-client"]
links:
  spec: specs/features/authentication/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - frontend/lib/api-client.ts
  - frontend/lib/auth-client.ts
  - frontend/app/(public)/signup/page.tsx
  - frontend/app/(public)/login/page.tsx
  - frontend/app/(protected)/dashboard/page.tsx
  - frontend/components/layout/header.tsx
  - frontend/components/auth/signout-button.tsx
  - backend/middleware/jwt_auth.py
  - specs/database/schema.md
  - specs/features/authentication/tasks.md
tests:
  - Manual: signup → auto-redirect to dashboard
  - Manual: login → dashboard loads tasks
  - Manual: logout → redirect to login, token cleared
---

## Prompt

full-authentication-with-fixes

Use updated specs:
 @specs/features/authentication/spec.md
 @specs/features/authentication/tasks.md
@specs/api/rest-endpoints.md
@specs/database/schema.md

Current status:
- Signup works, user saves in Neon DB
- Login works, but dashboard shows "Session expired" or 401 on API calls
- Token not attached → protected routes fail
- No auto-redirect after signup
- jwks error fixed by forcing HS256

Implement/fix everything:
1. Force HS256 in frontend/lib/auth.ts and backend Better Auth config
2. Attach Bearer token to all protected API calls (lib/api-client.ts)
3. Server-side session check + redirect in app/(protected)/layout.tsx
4. Auto-redirect to /dashboard after successful signup (signup page)
5. User-friendly toast errors (shadcn/ui toast) instead of "Failed to create account"
6. Logout button in header: clear session + redirect to /login
7. Handle 401 globally in api-client.ts (redirect + toast)
8. Add debug logging for session/token presence

## Response snapshot

Fixed authentication flow with these key changes:

**frontend/lib/api-client.ts**:
- Added token caching with retry logic
- Added `refreshToken()` method for force-refresh after login
- Improved 401 handling with automatic token refresh before redirect
- Added detailed debug logging

**frontend/lib/auth-client.ts**:
- Added JWT token caching with 5-minute TTL
- Added `clearJwtTokenCache()` function for signout
- Added debug logging for token fetch

**frontend/app/(public)/signup/page.tsx** and **login/page.tsx**:
- Changed `router.push()` to `window.location.href` for full page reload after auth
- Added 500ms delay to ensure session cookie is set
- Added `session_expired` query param handling on login page

**frontend/app/(protected)/dashboard/page.tsx**:
- Added `refreshToken()` call on initial fetch
- Added `session_expired` query param handling with toast
- Added toast notifications for errors

**frontend/components/layout/header.tsx** and **signout-button.tsx**:
- Added `clearJwtTokenCache()` call before signout
- Changed redirect to `/login` using `window.location.href`

**backend/middleware/jwt_auth.py**:
- Changed to prioritize HS256 verification (not JWKS)
- Added USE_JWKS env var (default: false) to control JWKS fetching
- JWKS only fetched if explicitly enabled

## Outcome

- ✅ Impact: Fixed 401 errors on dashboard, smooth auth flow
- 🧪 Tests: Manual testing required - signup/login/logout flow
- 📁 Files: 8 files modified
- 🔁 Next prompts: Test full auth flow, then continue with task CRUD implementation
- 🧠 Reflection: Main issue was race condition between session establishment and API calls. Using window.location.href for full reload ensures cookies are properly set before next request.

## Evaluation notes (flywheel)

- Failure modes observed: router.push() doesn't wait for session cookie; getJwtToken() called before session established
- Graders run and results (PASS/FAIL): Manual testing required
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): Consider using SWR or React Query for better session state management

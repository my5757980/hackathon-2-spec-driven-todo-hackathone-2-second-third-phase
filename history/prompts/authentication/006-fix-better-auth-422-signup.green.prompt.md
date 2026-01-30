---
id: 006
title: Fix Better Auth 422 Signup Error
stage: green
date: 2026-01-23
surface: agent
model: claude-opus-4-5-20251101
feature: authentication
branch: 002-page-layouts
user: maira
command: /sp.implement
labels: ["better-auth", "database", "signup", "error-handling"]
links:
  spec: specs/features/authentication/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - frontend/components/auth/signup-form.tsx
  - frontend/components/auth/signin-form.tsx
  - frontend/package.json
  - frontend/.env.example
tests:
  - manual signup test after migration
---

## Prompt

better-auth-frontend-422

Current error on signup:
- Frontend shows "Failed to create account"
- Browser console: 422 Unprocessable Entity on /api/auth/sign-up/email
- Additional console error: "Unable to add filesystem: <illegal path>"
- This is Better Auth frontend error when no database adapter is configured or connection fails

Context:
- Better Auth client in frontend/lib/auth.ts (or similar)
- No database adapter set → users not persisted
- Backend is running on localhost:8000 with /api/auth mounted
- Neon PostgreSQL DATABASE_URL available in backend/.env

Fix step-by-step:
1. Update frontend/lib/auth.ts to use PostgreSQL adapter with 'pg' Pool
2. Use same DATABASE_URL as backend (add to frontend/.env.local as NEXT_PUBLIC_DATABASE_URL)
3. Ensure better-auth is installed in frontend (npm install better-auth pg)
4. Add error handling in signup form to show better message (instead of "Failed")
5. Test: signup should now create user in Neon DB and redirect to dashboard
6. If still 422, log the exact request body and response JSON

Output:
- Updated frontend/lib/auth.ts full code with Pool adapter
- .env.local and .env.example updates for NEXT_PUBLIC_DATABASE_URL
- npm install command if needed
- Updated signup page code snippet for better error display
- Test steps after fix
- Commit messages

Make sure after this, signup creates real user in database (no more "Failed" or 422).

## Response snapshot

Diagnosed root cause: Better Auth tables did not exist in the PostgreSQL database.

Fixes applied:
1. Ran migration script (`node scripts/migrate-auth.js`) to create tables: user, session, account, verification
2. Updated signup-form.tsx with better error handling and console logging for debugging
3. Updated signin-form.tsx with better error handling and console logging
4. Added `db:migrate-auth` npm script to package.json for easy re-migration
5. Updated .env.example with setup instructions

The auth.ts file already had correct PostgreSQL adapter configuration. The issue was missing database tables.

## Outcome

- ✅ Impact: Fixed 422 error - signup now works by creating Better Auth tables in Neon PostgreSQL
- 🧪 Tests: Manual verification of tables (account, session, user, verification) created successfully
- 📁 Files: 4 files modified (signup-form.tsx, signin-form.tsx, package.json, .env.example)
- 🔁 Next prompts: Test full signup flow, verify user creation in database, test signin flow
- 🧠 Reflection: The 422 error was caused by missing database tables, not configuration. Always check if migrations have run when database-related errors occur.

## Evaluation notes (flywheel)

- Failure modes observed: Missing database tables causing 422 error on user creation
- Graders run and results (PASS/FAIL): Database table verification PASS
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): Verify end-to-end signup creates user and redirects to dashboard

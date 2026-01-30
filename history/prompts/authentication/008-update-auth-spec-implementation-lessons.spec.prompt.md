---
id: 008
title: Update Auth Spec with Implementation Lessons
stage: spec
date: 2026-01-26
surface: agent
model: claude-opus-4-5-20251101
feature: authentication
branch: 001-task-crud
user: maira
command: /sp.specify
labels: ["authentication", "better-auth", "jwt", "spec-update", "implementation-lessons"]
links:
  spec: specs/features/authentication/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/features/authentication/spec.md
tests:
  - null
---

## Prompt

I want to update my existing @specs/features/authentication/spec.md file.
Problems I faced during implementation:
- Better Auth adapter (pg Pool) config missing in frontend → user not persisted
- JWKS table error ("relation jwks does not exist") → needed to force HS256
- JWT token not attached to API calls → 401 Unauthorized on protected routes
- Signup success but no auto-redirect to dashboard
- Tables (user, session, account, verification) had to be created manually
- BETTER_AUTH_SECRET mismatch caused invalid token
- Rate limiting/logging not implemented yet
- No mention of "use client" vs server components for session handling

Task:
- Review the current spec line-by-line
- Add missing sections/details to prevent these exact problems in future implementations
- Keep all existing content intact — only add/improve
- Add new sections like:
  - Better Auth Configuration (frontend & backend)
  - JWT Mode (force HS256 with shared secret)
  - Database Adapter Setup (pg Pool for frontend & backend)
  - Table Creation / Migration Steps
  - Token Attachment in API Client
  - Redirect Logic after Signup/Signin
  - Common Error Handling & User Messages
  - Environment Variables Checklist (BETTER_AUTH_SECRET sync)
- Update Assumptions, Dependencies, and Success Criteria if needed
- Add "Updated: 2026-01-26" at top with changes summary
- Output the **FULL updated markdown file** ready to replace the old one

Make sure the updated spec:
- Is detailed enough for Claude/Sub-agents to implement without gaps
- Prevents all the problems I faced
- Remains clear, structured, and professional

## Response snapshot

Updated `specs/features/authentication/spec.md` with comprehensive new sections addressing all implementation problems:

1. **Better Auth Configuration** - Frontend (auth client, API route, auth instance) and backend (JWT verification middleware) setup
2. **JWT Mode Configuration** - Force HS256 algorithm to avoid JWKS table errors, with code examples
3. **Database Adapter Setup** - pg Pool configuration for user persistence
4. **Table Creation / Migration Steps** - SQL for all 4 required tables (user, session, account, verification) + task table extension
5. **Token Attachment in API Client** - Reusable API client with automatic Bearer token attachment
6. **Redirect Logic after Signup/Signin** - Complete flow with code examples
7. **Common Error Handling & User Messages** - Error code mapping table and parsing function
8. **Environment Variables Checklist** - BETTER_AUTH_SECRET sync verification
9. **Client vs Server Component Guidelines** - Next.js App Router patterns with common mistakes table
10. **Implementation Checklist** - Pre-deployment verification items

Added new clarifications, updated assumptions/dependencies, and added 4 new success criteria targeting the specific problems encountered.

## Outcome

- ✅ Impact: Major spec enhancement - prevents 8 specific implementation problems
- 🧪 Tests: No automated tests; spec is documentation
- 📁 Files: 1 file updated (specs/features/authentication/spec.md)
- 🔁 Next prompts: Run /sp.plan to update implementation plan, or /sp.tasks to regenerate tasks with new details
- 🧠 Reflection: Specs should capture implementation lessons as they're discovered to prevent repeating mistakes

## Evaluation notes (flywheel)

- Failure modes observed: Original spec lacked implementation-specific configuration details (adapter setup, algorithm choice, table creation, component patterns)
- Graders run and results (PASS/FAIL): Manual review - PASS (all requested sections added)
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): Consider adding a "Troubleshooting" section to future specs for common error → solution mappings

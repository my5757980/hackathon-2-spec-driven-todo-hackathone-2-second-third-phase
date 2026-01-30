---
id: 011
title: Update REST Endpoints Spec with Auth Lessons
stage: spec
date: 2026-01-26
surface: agent
model: claude-opus-4-5-20251101
feature: rest-endpoints
branch: 001-task-crud
user: maira
command: /sp.specify
labels: ["api", "rest", "authentication", "jwt", "cors", "spec-update"]
links:
  spec: specs/api/rest-endpoints.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/api/rest-endpoints.md
tests:
  - null
---

## Prompt

I want to update my existing @specs/api/rest-endpoints.md file.
Problems faced during implementation:
- 401 Unauthorized on protected endpoints because token not attached or invalid
- Tasks not saving/fetching due to auth failure
- Backend middleware not properly validating user_id path vs JWT sub claim
- No clear mention of token attachment in frontend API client
- CORS not configured → potential browser errors
- Query param validation (status, sort, order) not strict
- No mention of pagination or large result handling
- Rate limiting only on auth, not on task endpoints

Task:
- Review the current spec line-by-line
- Keep all existing content intact — only add/improve
- Add missing sections/details to prevent the problems I faced:
  - Exact JWT header format and frontend attachment (api-client.ts)
  - Backend middleware flow for user_id validation (validate_user_access)
  - 401 response body structure and frontend handling (redirect to login)
  - CORS configuration for frontend calls
  - Strict query param validation (valid values for status, sort, order)
  - Optional pagination params (page, limit) for future
  - Task ownership enforcement in every endpoint
  - Rate limiting recommendation for task endpoints (Phase 3)
- Update Assumptions, Dependencies, and Error Codes if needed
- Add "Updated: 2026-01-26" at top with changes summary
- Output the **FULL updated markdown file** ready to replace the old one

Make sure the updated spec:
- Is detailed enough for Claude/Sub-agents to implement without auth/token issues
- Prevents 401 errors and token attachment problems
- Remains clear, structured, and consistent with authentication.md

## Response snapshot

Updated `specs/api/rest-endpoints.md` with comprehensive new sections addressing all implementation problems:

### New Sections Added

1. **Frontend Token Attachment** - Complete api-client.ts implementation with automatic token attachment and 401 handling
2. **Backend Authentication Middleware** - Full middleware flow with `get_current_user` and `validate_user_access` dependencies
3. **CORS Configuration** - FastAPI CORS middleware setup with environment-based origins
4. **Error Response Structure** - Standardized error format with frontend handling examples
5. **Query Parameter Validation** - Strict enum validation with valid values table
6. **Pagination (Phase 3)** - Optional pagination params (page, limit) with response structure
7. **Rate Limiting (Phase 3)** - Recommended limits per endpoint type
8. **Common Issues & Solutions** - Troubleshooting section for frequent problems

### Updated Sections

- **Task Ownership Enforcement** note added to each endpoint
- **Error Codes Summary** expanded with all 401 variations
- **Assumptions** updated with CORS and apiClient requirements
- **Dependencies** updated to reference authentication.md

### Key Implementation Details

- JWT header format: `Authorization: Bearer <token>`
- Token location: `session.session.token` from `authClient.getSession()`
- User ID validation: Path `{user_id}` must match JWT `sub` claim
- 401 handling: Frontend redirects to `/signin?error=session_expired`
- CORS: Specific origin (not `*`), credentials allowed

## Outcome

- ✅ Impact: Comprehensive API spec update - prevents 8 specific implementation problems
- 🧪 Tests: No automated tests; spec is documentation
- 📁 Files: 1 file updated (specs/api/rest-endpoints.md)
- 🔁 Next prompts: Run /sp.plan to create implementation plan, or update tasks.md
- 🧠 Reflection: API specs should include client-side integration patterns, not just endpoint definitions

## Evaluation notes (flywheel)

- Failure modes observed: Original spec lacked frontend integration details (token attachment, error handling, CORS)
- Graders run and results (PASS/FAIL): Manual review - PASS (all requested sections added)
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): Add OpenAPI/Swagger schema generation from spec

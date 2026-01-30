---
id: 0004
title: Backend JWT Middleware Skill Creation
stage: general
date: 2026-01-22
surface: agent
model: claude-opus-4-5-20251101
feature: none
branch: 002-page-layouts
user: maira
command: natural language request
labels: ["skill", "jwt", "fastapi", "python-jose", "better-auth", "middleware"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - .claude/skills/backend-jwt-middleware/SKILL.md
tests:
  - n/a (skill documentation)
---

## Prompt

backend-jwt-middleware

Create a reusable skill for generating FastAPI JWT verification middleware and dependencies in Phase 2 Todo app backend.

First, use Context 7 (MCP server) to fetch latest data:
- Resolve library ID for "fastapi" (OAuth2PasswordBearer, dependencies in v0.115+)
- Resolve library ID for "python-jose" (JWT verification, latest version)
- Resolve library ID for "better-auth" (JWT format, access_token field, shared secret)
- Fetch latest docs/best practices for FastAPI + Better Auth JWT integration (middleware for token verify, user_id extract, 401 on failure)

Key patterns from our Todo app work:
- Verify JWT from Authorization: Bearer <token> header
- Use shared secret BETTER_AUTH_SECRET (env var)
- Extract user_id (string/UUID) from decoded token
- Raise HTTPException(401) if invalid/missing/expired token
- Use dependency to inject current_user (user_id) in protected routes
- Filter all task queries by user_id (ownership enforcement)
- Use python-jose for decoding/verification (HS256 algorithm)

Use research-concurrent approach: fetch latest data while building the skill.

Structure the skill file like this:
- YAML frontmatter (name, description, version)
- When to use this skill
- Step-by-step process (including Context 7 fetch)
- Output format (full middleware + dependency code)
- Example input/output (protected route usage)

Output the FULL SKILL.md content ready to save as .claude/skills/backend-jwt-middleware/SKILL.md

After generating, confirm:
- Latest python-jose/FastAPI usage
- Exact file path example: backend/dependencies/auth.py
- Skill is testable and reusable

## Response snapshot

Created comprehensive skill file at `.claude/skills/backend-jwt-middleware/SKILL.md` (598 lines) with:

1. **Context7 Research**: Fetched latest docs for:
   - FastAPI 0.115+ (`/websites/fastapi_tiangolo` - benchmark 96.8)
   - python-jose 3.3+ (`/mpdavis/python-jose`)
   - Better Auth 1.4+ (`/llmstxt/better-auth_llms_txt`)

2. **Complete auth.py Implementation**:
   - `OAuth2PasswordBearer` for token extraction
   - `verify_token()` with python-jose decode and error handling
   - `get_current_user` dependency for protected routes
   - `get_current_user_optional` for mixed public/private routes
   - `get_user_id` convenience dependency
   - Type aliases: `AuthenticatedUser`, `OptionalUser`, `UserId`

3. **Ownership Enforcement**:
   - `require_ownership()` helper function
   - `OwnershipChecker` reusable class
   - Repository pattern with owner_id filtering

4. **Error Handling**:
   - ExpiredSignatureError → 401 "Token has expired"
   - JWTClaimsError → 401 "Invalid token claims"
   - JWTError → 401 "Invalid token"
   - Ownership violation → 403 "Not authorized"

Key patterns from Context7:
- FastAPI: `Annotated[str, Depends(oauth2_scheme)]` pattern
- python-jose: `jwt.decode(token, secret, algorithms=['HS256'])` with options
- Better Auth: `sub` claim contains user_id

## Outcome

- Impact: Created reusable skill for FastAPI JWT auth across Phase 2+ projects
- Tests: Skill includes 8-point testing checklist
- Files: 1 file created (.claude/skills/backend-jwt-middleware/SKILL.md)
- Next prompts: Use skill to generate actual backend/dependencies/auth.py in Phase 2
- Reflection: Context7 provided up-to-date FastAPI OAuth2 patterns and python-jose error types

## Evaluation notes (flywheel)

- Failure modes observed: None - all library IDs resolved successfully
- Graders run and results (PASS/FAIL): PASS - skill file validates with complete YAML frontmatter
- Prompt variant (if applicable): Research-concurrent approach (parallel MCP queries)
- Next experiment (smallest change to try): Add refresh token rotation pattern

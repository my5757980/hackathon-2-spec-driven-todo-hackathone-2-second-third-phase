---
id: 012
title: Update Database Schema Spec with Better Auth Implementation Details
stage: spec
date: 2026-01-29
surface: agent
model: claude-opus-4-5-20251101
feature: database-schema
branch: 001-task-crud
user: maira
command: /sp.specify
labels: ["database", "better-auth", "schema", "jwt", "migration"]
links:
  spec: specs/database/schema.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/database/schema.md
tests:
  - null
---

## Prompt

I want to update my existing @specs/database/schema.md file.
Problems faced during implementation:
- Had to manually create Better Auth tables (user, session, account, verification) via SQL Editor
- "relation jwks does not exist" error when using getSession() → JWKS mode was on, but no jwks table
- Better Auth adapter (pg Pool) not mentioned → frontend DB connection failed initially
- No mention of migration process or automatic table creation
- JWT mode (HS256 vs JWKS) not specified → caused jwks table error
- Foreign key CASCADE behavior not explicitly detailed for user deletion
- Timestamps timezone handling not clear (WITH TIME ZONE?)
- No mention of how Better Auth integrates/manages user table schema

Task:
- Review the current spec line-by-line
- Keep all existing content intact — only add/improve
- Add missing sections/details to prevent these problems in future:
  - Better Auth tables (user, session, account, verification) — fields, constraints, indexes
  - JWT mode recommendation: prefer HS256 with shared secret (disable JWKS/RS256)
  - Database adapter setup (pg Pool for frontend/backend)
  - Table creation/migration process (Better Auth auto-migrate or manual SQL)
  - Foreign key constraints (ON DELETE CASCADE for user → tasks)
  - Timestamps: use TIMESTAMP WITH TIME ZONE
  - Better Auth user table integration (how it creates/manages user schema)
  - Optional: jwks table if JWKS mode ever needed (but recommend against)
- Update Assumptions, Requirements, and Success Criteria if needed
- Add "Updated: 2026-01-26" at top with changes summary
- Output the **FULL updated markdown file** ready to replace the old one

Make sure the updated spec:
- Is detailed enough for Claude/Sub-agents to implement without manual SQL or adapter issues
- Prevents "jwks does not exist", missing tables, and connection failures
- Remains clear, structured, and consistent with authentication.md

## Response snapshot

Updated `specs/database/schema.md` with comprehensive implementation details:

1. **Better Auth Tables**: Added complete SQL schemas for user, session, account, verification tables with all field details, constraints, and indexes
2. **JWT Mode Configuration**: Added section recommending HS256, explaining why to avoid JWKS, with code examples for frontend and backend
3. **Database Adapter Setup**: Added pg Pool configuration for frontend and SQLModel setup for backend
4. **Table Creation / Migration Process**: Added complete migration script with all 5 tables, verification queries, and migration order
5. **JWKS Table (Optional)**: Explained why not recommended, what error it causes, and how to fix
6. **Better Auth User Table Integration**: How Better Auth manages users, creation flow, user ID format, accessing user data
7. **Timestamps and Timezone Handling**: TIMESTAMP WITH TIME ZONE requirement with Python/TypeScript examples
8. **Foreign Key CASCADE Behavior**: Detailed table of cascade effects with rationale
9. **Updated Requirements**: Added FR-013, FR-014, FR-015 for Better Auth tables
10. **Updated Success Criteria**: Added SC-008 through SC-012 for implementation readiness
11. **Implementation Checklist**: Pre-deployment verification checklist with SQL verification query

## Outcome

- ✅ Impact: Database schema spec now comprehensive enough to prevent all reported implementation issues
- 🧪 Tests: N/A (specification document)
- 📁 Files: specs/database/schema.md updated
- 🔁 Next prompts: Consider running `/sp.clarify` if further details needed, or proceed to implementation
- 🧠 Reflection: Implementation lessons learned encoded back into spec - this prevents future engineers from hitting same issues

## Evaluation notes (flywheel)

- Failure modes observed: Original spec lacked implementation-level details for Better Auth integration
- Graders run and results (PASS/FAIL): N/A
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): Consider adding troubleshooting section for common errors

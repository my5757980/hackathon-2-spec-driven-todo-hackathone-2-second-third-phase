---
id: 005
title: Database Schema Specification
stage: spec
date: 2026-01-19
surface: agent
model: claude-opus-4-5-20251101
feature: database-schema
branch: 001-authentication
user: maira
command: /sp.specify
labels: ["database", "schema", "phase2", "postgresql", "neon"]
links:
  spec: specs/database/schema.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/database/schema.md
  - specs/database/checklists/requirements.md
tests:
  - N/A (specification only)
---

## Prompt

schema
@.spec-kit/config.yaml
@specs/overview.md
@specs/architecture.md

Target audience: Backend developers and database administrators implementing persistent storage for the multi-user Todo web app (Phase 2+)
Focus: Define the database schema for Neon Serverless PostgreSQL to support task-crud with user isolation, including users table (managed by Better Auth) and tasks table with foreign key relationship
Success criteria:

Users table managed by Better Auth (id as string/UUID primary key, email unique)
Tasks table includes user_id foreign key to users.id for ownership enforcement
All required fields for basic CRUD: id (integer PK), title (string not null), description (text nullable), completed (boolean default false), created_at/updated_at (timestamps)
Indexes on tasks.user_id (for fast filtering by user) and tasks.completed (for status queries)
All claims testable: schema supports JWT-based user isolation and task ownership

Constraints:

Phase 2+: Use SQLModel (ORM) for models and migrations
Database: Neon Serverless PostgreSQL
Users table: managed by Better Auth (no manual creation needed)
Tasks table: user_id foreign key enforced
No additional tables for Phase 2 (e.g., no conversations/messages yet)
Exact file path: specs/database/schema.md (create folder under specs/database/ if missing)

Not building:

Full migration scripts or Alembic setup details (focus on schema definition only)
Advanced indexing or partitioning (basic indexes only)
Views or stored procedures (simple table structure)
Schema for Phase 3+ features (chatbot, recurring, etc. – separate specs)

## Response snapshot

Created comprehensive database schema specification for Phase 2 multi-user Todo web app:

**Entities Defined:**
- **User**: id (string/UUID PK), email (unique, not null) - managed by Better Auth
- **Task**: id (integer auto-increment PK), title (string not null, max 255), description (text nullable), completed (boolean default false), created_at/updated_at (timestamps), user_id (FK to User.id, not null)

**Key Requirements (12 FRs):**
- User isolation via user_id foreign key
- Indexes on tasks.user_id and tasks.completed for query performance
- CASCADE delete for user-task relationship
- Automatic timestamp tracking

**User Stories (4):**
1. Task data persistence (P1)
2. Task completion status tracking (P1)
3. User account storage (P1)
4. Task ownership query performance (P2)

**Success Criteria:**
- 100% data integrity across restarts
- User isolation enforcement
- Sub-100ms queries for up to 100K tasks
- Full CRUD support

## Outcome

- ✅ Impact: Database schema spec created for Phase 2 persistent storage
- 🧪 Tests: N/A (specification only - tests will be in implementation)
- 📁 Files: 2 created (schema.md, requirements checklist)
- 🔁 Next prompts: /sp.plan for implementation planning, /sp.tasks for task breakdown
- 🧠 Reflection: Spec follows template structure; all clarification items resolved with reasonable defaults

## Evaluation notes (flywheel)

- Failure modes observed: None - all checklist items passed on first iteration
- Graders run and results (PASS/FAIL): Requirements checklist PASS (all 12 items)
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): Consider adding explicit index naming conventions for consistency

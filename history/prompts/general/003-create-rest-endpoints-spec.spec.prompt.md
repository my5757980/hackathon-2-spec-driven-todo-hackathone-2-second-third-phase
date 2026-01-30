---
id: 003
title: Create REST Endpoints API Specification
stage: spec
date: 2026-01-19
surface: agent
model: claude-opus-4-5-20251101
feature: rest-endpoints
branch: main
user: maira
command: /sp.specify
labels: ["api", "rest", "endpoints", "phase-2", "task-crud"]
links:
  spec: specs/api/rest-endpoints.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/api/rest-endpoints.md
  - specs/api/checklists/rest-endpoints.md
tests:
  - N/A (specification phase)
---

## Prompt

rest-endpoints
@.spec-kit/config.yaml
@specs/overview.md
@specs/architecture.md

Target audience: Backend developers and API consumers for the Todo app's full-stack web application (Phase 2+)
Focus: Define RESTful API endpoints for task management, including methods, parameters, request/response schemas, and JWT authentication integration
Success criteria:

All 6 endpoints documented (GET/POST/PUT/DELETE/PATCH for tasks and complete toggle)
Each endpoint specifies path with {user_id}, query params, request body, response format, error codes
JWT requirement explicit: Authorization Bearer header, 401 on invalid/no token
User isolation: Endpoints filter by authenticated user_id
Integration with Better Auth: JWT issued on login, verified in FastAPI middleware
Testable: Example requests/responses for each endpoint

Constraints:

Phase 2+: Use FastAPI for endpoint implementation
Paths: /api/{user_id}/tasks and /api/{user_id}/tasks/{id}
JWT verification with shared BETTER_AUTH_SECRET env var
Response JSON with Pydantic models
Error handling: HTTPException for 401, 404 (task not found), 400 (bad request)
Exact file path: specs/api/rest-endpoints.md (create folder under specs/api/ if missing)

Not building:

Non-task endpoints (focus on core CRUD only)
Pagination or advanced filtering (basic query params like status/sort)
Webhooks or real-time push (use Dapr/Kafka in Phase 5)
Custom error pages (standard JSON errors only)

## Response snapshot

Created comprehensive REST API specification at `specs/api/rest-endpoints.md` with:

**6 Endpoints Documented:**
1. GET /api/{user_id}/tasks - List tasks with query params (status, sort, order)
2. GET /api/{user_id}/tasks/{task_id} - Get single task
3. POST /api/{user_id}/tasks - Create task
4. PUT /api/{user_id}/tasks/{task_id} - Full update
5. PATCH /api/{user_id}/tasks/{task_id} - Partial update (completion toggle)
6. DELETE /api/{user_id}/tasks/{task_id} - Delete task

**Key Features:**
- All endpoints require JWT Bearer authentication
- User isolation enforced (404 for unauthorized access)
- Complete request/response examples with realistic UUIDs
- Data models defined (Task object, Error object)
- Error codes: 200, 201, 204, 400, 401, 404

Quality checklist created and validated (all items pass).

## Outcome

- ✅ Impact: Complete API contract for Phase 2 task CRUD operations
- 🧪 Tests: N/A (specification phase)
- 📁 Files: Created rest-endpoints.md and validation checklist
- 🔁 Next prompts: Implementation can reference this spec for FastAPI routes
- 🧠 Reflection: This is an API spec (technical) rather than feature spec (business-focused); appropriate level of detail for developer audience

## Evaluation notes (flywheel)

- Failure modes observed: None
- Graders run and results (PASS/FAIL): Quality checklist PASSED (all items)
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): N/A

---
id: 5
title: Fix task not saving in DB
stage: green
date: 2026-01-24
surface: agent
model: claude-opus-4-5-20251101
feature: task-crud
branch: 001-task-crud
user: maira
command: /sp.implement
labels: ["bug-fix", "api-integration", "frontend", "backend"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - frontend/app/(protected)/dashboard/page.tsx
  - backend/routes/tasks.py
tests:
  - Manual testing required: Add Task button should save to Neon DB
---

## Prompt

task-not-saving-in-db

Current problem:
- Dashboard pe "Add Task" button click karne pe task form submit hota hai
- Lekin Neon DB ke task table mein koi new row nahi ban rahi (0 rows)
- Login successful hai (user table mein entry hai), backend chal raha hai
- Frontend: localhost:3000, backend: localhost:8000

Root cause possibilities:
- Frontend se POST request /api/{user_id}/tasks nahi ja raha (form submit handler missing ya fail)
- Request ja raha hai lekin backend mein insert fail (validation error, user_id mismatch, DB error)
- JWT token nahi ja raha → 401 Unauthorized
- DB transaction fail (connection issue, foreign key violation)

Fix step-by-step:
1. Check frontend code for Add Task form (app/dashboard/page.tsx ya components/task-form.tsx) — onSubmit handler mein fetch POST to /api/${user.id}/tasks hai ya nahi? Show updated code snippet.
2. Add console.log before fetch to see if handler runs
3. Add error handling in fetch: console.log(response.status, await response.json())
4. In backend routes/tasks.py — POST endpoint mein print statements add karo (request body print, user_id, insert try/except)
5. Ensure user_id from JWT matches path user_id (validate_user_access function call)
6. Test with curl: curl -X POST http://localhost:8000/api/{your_user_id}/tasks -H "Authorization: Bearer {token}" -H "Content-Type: application/json" -d '{"title":"Test Task","description":"Test"}'
   - Token frontend se copy karo (localStorage ya session)
7. If insert fails, add logging in db.py or task model
8. Verify Neon connection in backend (test query: SELECT 1)

Output:
- Updated frontend Add Task handler code (with logging)
- Updated backend tasks.py POST endpoint (with logging)
- curl test command with example token
- What to expect in Neon task table after successful add
- Commit messages

Make sure after this fix, Add Task button pe task Neon DB mein save ho aur dashboard list mein dikhe.

## Response snapshot

**Root Cause Identified:** The frontend `handleCreateTask` function only updated local React state and never called the backend API. The api-client.ts had the correct `createTask()` method, but it was never invoked.

**Fix Applied:**
1. Updated `dashboard/page.tsx` to import `api` from `api-client.ts` and `useSession` from `auth-client.ts`
2. Added `useEffect` to fetch tasks from backend on component mount using `api.getTasks(userId)`
3. Updated `handleCreateTask` to call `api.createTask(userId, data)` instead of just setting local state
4. Updated `handleUpdateTask` to call `api.updateTask(userId, taskId, data)`
5. Updated `handleDelete` to call `api.deleteTask(userId, taskId)`
6. Updated `handleToggleComplete` to call `api.updateTask(userId, taskId, { completed })`
7. Added console.log statements throughout for debugging
8. Added loading state and error banner UI
9. Added backend logging in `routes/tasks.py` for POST and GET endpoints

## Outcome

- ✅ Impact: Frontend now properly calls backend API for all CRUD operations
- 🧪 Tests: Manual testing required - Add Task should now persist to Neon DB
- 📁 Files: 2 files modified (dashboard/page.tsx, routes/tasks.py)
- 🔁 Next prompts: Test the fix, verify tasks appear in Neon DB, remove debug logs after verification
- 🧠 Reflection: The API client was implemented correctly but never connected to the UI handlers - a common integration oversight

## Evaluation notes (flywheel)

- Failure modes observed: Frontend-backend integration gap - handlers used local state only
- Graders run and results (PASS/FAIL): N/A - manual testing required
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): Verify with browser DevTools Network tab that POST request goes through

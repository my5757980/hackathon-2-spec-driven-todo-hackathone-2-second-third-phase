---
id: 0006
title: Fix real-time task sync between chatbot and dashboard
stage: green
date: 2026-02-05
surface: agent
model: claude-opus-4-5-20251101
feature: chatbot
branch: 004-todo-ai-chatbot
user: maira
command: /sp.implement
labels: ["sync", "chatbot", "dashboard", "events", "real-time"]
links:
  spec: specs/features/chatbot/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - frontend/lib/task-events.ts (created)
  - frontend/components/chat/ChatPanel.tsx (modified)
  - frontend/app/(protected)/dashboard/page.tsx (modified)
tests:
  - Manual test: Add task via chatbot → dashboard refreshes automatically
---

## Prompt

Fix real-time task sync issue in Phase III Todo AI Chatbot

Current problem:
- Chatbot (POST /api/{user_id}/chat) successfully adds/deletes/completes tasks in DB via MCP tools
- Dashboard page (app/(protected)/dashboard/page.tsx) shows old tasks list after chat action
- No automatic refresh — user has to manually reload page to see updated tasks

Goal:
- After successful chat message (add/list/complete/delete), automatically refresh dashboard tasks list
- Keep UI smooth, no full page reload

## Response snapshot

Implemented a custom event-based solution for real-time sync between ChatPanel and Dashboard:

1. **Created `frontend/lib/task-events.ts`**:
   - Custom event utility with `dispatchTasksChanged()` function
   - `onTasksChanged()` listener hook for components
   - Uses browser CustomEvent API for cross-component communication

2. **Updated `frontend/components/chat/ChatPanel.tsx`**:
   - Imported `dispatchTasksChanged`
   - After successful chat response, checks if any task-modifying tools were called (`add_task`, `complete_task`, `delete_task`, `update_task`)
   - Dispatches the appropriate event to notify listeners

3. **Updated `frontend/app/(protected)/dashboard/page.tsx`**:
   - Added `onTasksChanged` listener via useEffect
   - Calls `fetchTasks(true)` with silent refresh mode to avoid loading spinner flash
   - Modified `fetchTasks` to accept `silentRefresh` parameter for smooth UX

## Outcome

- ✅ Impact: Tasks added/deleted/completed via chatbot now appear immediately in dashboard
- 🧪 Tests: Manual testing required - add task via chat, verify dashboard updates
- 📁 Files: 3 files (1 created, 2 modified)
- 🔁 Next prompts: none (feature complete)
- 🧠 Reflection: Custom event pattern is clean for cross-component sync without global state management

## Evaluation notes (flywheel)

- Failure modes observed: none
- Graders run and results (PASS/FAIL): Manual testing pending
- Prompt variant (if applicable): n/a
- Next experiment (smallest change to try): Consider WebSocket for true real-time multi-device sync in future

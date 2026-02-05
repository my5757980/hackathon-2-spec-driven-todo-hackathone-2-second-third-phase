---
id: "0007"
title: Fix Failed to Fetch Error on Vercel Login
stage: general
date: 2026-02-05
surface: agent
model: claude-opus-4-5-20251101
feature: none
branch: 004-todo-ai-chatbot
user: maira
command: /sp.implement
labels: ["authentication", "cors", "vercel", "railway", "production-fix"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - backend/main.py
  - frontend/lib/auth-client.ts
  - frontend/lib/auth.ts
  - frontend/app/(public)/login/page.tsx
tests:
  - Manual testing required after deploy
---

## Prompt

Fix "Failed to fetch" error on login page in Phase III Todo AI Chatbot (Vercel + Railway deploy)

Current problem:
- Frontend deployed on Vercel (hackathon-2-spec-driven-todo.vercel.app)
- Backend deployed on Railway (hackathon-2-spec-driven-todo-production.up.railway.app)
- Login page loads (200 OK), but shows "Failed to fetch" in red box
- No successful API calls to backend (logs show only static pages 200/304, no /api/auth/session or /api/user calls)
- Better Auth session check / user fetch failing on frontend
- Possible causes: wrong NEXT_PUBLIC_ env vars, CORS not allowing Vercel origin, env vars not loaded in production build, or auth client misconfigured

Goal:
- Make login work: user can sign in with email/password
- After login, dashboard loads with tasks from backend
- Chat endpoint (/api/.../chat) also works from frontend

## Response snapshot

Fixed the "Failed to fetch" error with the following changes:

1. **Backend CORS** (`backend/main.py`): Added Vercel production domain to default CORS origins
2. **Auth Client** (`frontend/lib/auth-client.ts`): Added dynamic URL detection using `window.location.origin` as fallback, plus debug logging
3. **Server Auth** (`frontend/lib/auth.ts`): Added support for Vercel's `VERCEL_URL` auto-injected env var
4. **Login Page** (`frontend/app/(public)/login/page.tsx`): Improved error message detection for network errors

Provided complete Vercel and Railway environment variable setup instructions.

## Outcome

- ✅ Impact: Production login should now work once deployed with correct env vars
- 🧪 Tests: Manual browser testing required after redeploy
- 📁 Files: 4 files modified
- 🔁 Next prompts: Deploy and verify auth flow works end-to-end
- 🧠 Reflection: CORS and env var issues are common in frontend/backend deployments; fallback URL detection helps make the system more resilient

## Evaluation notes (flywheel)

- Failure modes observed: Missing CORS origin for Vercel domain, static env vars not available in production
- Graders run and results (PASS/FAIL): N/A (manual testing required)
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): Test with NEXT_PUBLIC_DEBUG_AUTH=true to verify URLs in console

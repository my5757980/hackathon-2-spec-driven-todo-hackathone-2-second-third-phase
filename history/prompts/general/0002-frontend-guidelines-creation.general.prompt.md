---
id: 0002
title: Frontend Guidelines Creation
stage: general
date: 2026-01-22
surface: agent
model: claude-opus-4-5-20251101
feature: none
branch: 002-page-layouts
user: maira
command: direct-request
labels: ["frontend", "guidelines", "claude-md", "phase2", "documentation"]
links:
  spec: specs/ui/components.md
  ticket: null
  adr: null
  pr: null
files:
  - frontend/CLAUDE.md (created)
tests:
  - N/A (documentation)
---

## Prompt

```text
@frontend/CLAUDE.md
Exact file path (create folder if missing): frontend/CLAUDE.md

Target audience: Claude Code when working on frontend code (Next.js App Router) in Phase 2 full-stack Todo app

Focus: Provide clear, actionable guidelines for frontend implementation including stack, patterns, component structure, API client, styling, auth integration (Better Auth + JWT), and best practices

Success criteria:
- Covers Next.js 16+ App Router patterns (server components by default, client only when needed)
- Explains Better Auth integration for signup/signin and JWT token handling
- Defines API client usage (/lib/api.ts) for all backend calls
- Specifies Tailwind CSS usage, no inline styles
- Includes folder structure (/app, /components/ui, /components/features, /lib)
- Guides on auth guards, protected routes, and user session access
- References @specs/ui/components.md and @specs/ui/pages.md for UI specs

Constraints:
- Phase 2: Next.js 16+ (App Router), TypeScript, Tailwind CSS, Shadcn UI (optional)
- Authentication: Better Auth (frontend) → JWT tokens → attach to API headers
- API calls: Use centralized api client from /lib/api.ts
- Styling: Tailwind classes only, follow design tokens from @specs/ui/components.md
- No Zod validation for auth (use Better Auth built-in)
- Dark theme only, no light mode toggle
- Exact file path: frontend/CLAUDE.md (create frontend/ folder if missing)

Not building:
- Backend guidelines (those go in backend/CLAUDE.md)
- Full app routing details (reference @specs/ui/pages.md)
- Phase 3+ frontend (chatbot UI – separate spec)
- Custom form validation beyond Better Auth (no Zod for login/signup)
```

## Response snapshot

Created comprehensive frontend guidelines at `frontend/CLAUDE.md` containing:

1. **Stack**: Next.js 16+ (App Router), TypeScript, Tailwind CSS 4.x, Shadcn UI, Lucide React, Framer Motion
2. **Patterns**: Server components by default, client components only when needed, data fetching strategies
3. **Folder Structure**: Complete directory layout for /app, /components/ui, /components/features, /lib
4. **API Client**: Full implementation of centralized API client with JWT token handling
5. **Auth Integration**: Better Auth setup, signup/signin forms, OAuth providers, protected routes, session access
6. **Styling**: Tailwind-only approach, design tokens from components.md, cn() utility pattern
7. **Component Guidelines**: UI vs feature components, accessibility requirements
8. **Responsive Design**: Breakpoint reference matching pages.md spec
9. **Error Handling**: API errors with toast notifications, loading states
10. **Quick Reference**: Table of common tasks and how to accomplish them

## Outcome

- ✅ Impact: Complete frontend development guidelines ready for Phase 2 implementation
- 🧪 Tests: N/A (documentation file)
- 📁 Files: 1 file created (frontend/CLAUDE.md)
- 🔁 Next prompts: Create `backend/CLAUDE.md` for backend guidelines, then begin implementation with `/sp.plan`
- 🧠 Reflection: Guidelines provide clear, actionable patterns that reference existing UI specs. Includes code examples for all major patterns (API client, auth, components, styling).

## Evaluation notes (flywheel)

- Failure modes observed: None - all requirements met
- Graders run and results (PASS/FAIL): Manual review - PASS (covers all success criteria)
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): Consider adding testing guidelines (Jest/Playwright) in future iteration

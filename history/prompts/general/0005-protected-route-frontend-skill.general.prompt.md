---
id: 0005
title: Protected Route Frontend Skill Creation
stage: general
date: 2026-01-22
surface: agent
model: claude-opus-4-5-20251101
feature: none
branch: 002-page-layouts
user: maira
command: natural language request
labels: ["skill", "protected-routes", "next.js", "better-auth", "authentication", "layout", "middleware"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - .claude/skills/protected-route-frontend/SKILL.md
tests:
  - n/a (skill documentation)
---

## Prompt

protected-route-frontend

Create a reusable skill for generating protected route wrappers/layouts in Next.js frontend for Phase 2 Todo app.

First, use Context 7 (MCP server) to fetch latest data:
- Resolve library ID for "better-auth" (session handling, useSession, getSession in v1.4+)
- Resolve library ID for "next.js" (App Router protected routes, middleware proxy in v16+)
- Resolve library ID for "next/navigation" (redirect function)
- Fetch latest docs/best practices for Better Auth protected routes in Next.js (server-side session check, client-side fallback, redirect on no session)

Key patterns from our Todo app work:
- Check Better Auth session on server-side (preferred) or client-side
- If no active session → redirect to /login
- If session exists → render children (protected page content)
- Use middleware or layout wrapper for protection
- Handle loading state (optional skeleton while checking session)
- TypeScript typed (session.user.id etc.)

Use research-concurrent approach: fetch latest data while building the skill.

Structure the skill file like this:
- YAML frontmatter (name, description, version)
- When to use this skill
- Step-by-step process (including Context 7 fetch)
- Output format (full layout.tsx or middleware code)
- Example input/output (protected dashboard page)

Output the FULL SKILL.md content ready to save as .claude/skills/protected-route-frontend/SKILL.md

After generating, confirm:
- Latest Better Auth session check method used
- Exact file path example: app/(protected)/layout.tsx
- Skill handles both server-side and client-side protection
- Skill is testable and reusable

## Response snapshot

Created comprehensive skill file at `.claude/skills/protected-route-frontend/SKILL.md` (641 lines) with:

1. **Context7 Research**: Fetched latest docs for:
   - Better Auth 1.4+ (`/llmstxt/better-auth_llms_txt` - benchmark 81.6)
   - Next.js 16+ (`/vercel/next.js/v16.1.1` - benchmark 91.5)

2. **Protection Strategies Table**:
   | Strategy | Location | Use Case |
   |----------|----------|----------|
   | Layout (Server) | `app/(protected)/layout.tsx` | Primary - secure |
   | Middleware | `middleware.ts` | Optimistic redirects |
   | Page (Server) | Individual `page.tsx` | Per-page protection |
   | Client Wrapper | `components/ProtectedRoute.tsx` | Loading states |

3. **Key Components**:
   - `app/(protected)/layout.tsx` - Server-side session check with `auth.api.getSession()`
   - `middleware.ts` - Optimistic route protection with matcher config
   - `components/auth/ProtectedRoute.tsx` - Client wrapper with `isPending` handling
   - `components/providers/SessionProvider.tsx` - Pass session to client components
   - `hooks/useAuthGuard.ts` - Reusable auth hook

4. **Patterns from Context7**:
   - Better Auth: `auth.api.getSession({ headers: await headers() })`
   - Better Auth client: `useSession()` returns `{ data, isPending, error, refetch }`
   - Next.js 16+: `redirect()` from `next/navigation`, async `headers()`
   - Middleware: `runtime: "nodejs"` for Better Auth session check

## Outcome

- Impact: Created reusable skill for protected routes across Phase 2+ projects
- Tests: Skill includes 8-point testing checklist
- Files: 1 file created (.claude/skills/protected-route-frontend/SKILL.md)
- Next prompts: Use skill to generate actual app/(protected)/layout.tsx in Phase 2
- Reflection: Defense-in-depth approach (Layout + Middleware + Page) is key insight from Context7 docs

## Evaluation notes (flywheel)

- Failure modes observed: None - all library IDs resolved successfully
- Graders run and results (PASS/FAIL): PASS - skill file validates with complete YAML frontmatter
- Prompt variant (if applicable): Research-concurrent approach (parallel MCP queries)
- Next experiment (smallest change to try): Add role-based access control (RBAC) variant

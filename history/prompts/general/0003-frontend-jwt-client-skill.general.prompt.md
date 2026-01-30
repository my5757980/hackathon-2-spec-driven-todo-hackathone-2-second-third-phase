---
id: 0003
title: Frontend JWT Client Skill Creation
stage: general
date: 2026-01-22
surface: agent
model: claude-opus-4-5-20251101
feature: none
branch: 002-page-layouts
user: maira
command: natural language request
labels: ["skill", "jwt", "api-client", "better-auth", "next.js"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - .claude/skills/frontend-jwt-client/SKILL.md
tests:
  - n/a (skill documentation)
---

## Prompt

frontend-jwt-client

Create a reusable skill for generating frontend API clients in Next.js that automatically attach JWT from Better Auth session.

First, use Context 7 (MCP server) to fetch latest data:
- Resolve library ID for "better-auth" (JWT plugin, session management, latest version v1.4+)
- Resolve library ID for "next.js" (App Router, server/client components in v16+)
- Resolve library ID for "fetch" or "axios" (best practice for API calls)
- Fetch latest docs/best practices for Better Auth JWT integration in Next.js (stateless sessions, token attachment, redirect on 401)

Key patterns from our Todo app work:
- Automatically get JWT token from Better Auth session (useSession() or getSession())
- Add Authorization: Bearer <token> header if token exists
- If no token or 401 response → redirect to /login
- Use typed fetch with TypeScript
- All calls go through centralized /lib/api.ts
- Handle JSON parsing and errors cleanly

Use research-concurrent approach: fetch latest data while building the skill.

Structure the skill file like this:
- YAML frontmatter (name, description, version)
- When to use this skill
- Step-by-step process (including Context 7 fetch)
- Output format (full /lib/api.ts code with typed methods)
- Example input/output

Output the FULL SKILL.md content ready to save as .claude/skills/frontend-jwt-client/SKILL.md

After generating, confirm:
- Latest Better Auth version used
- Exact file path: frontend/lib/api.ts example
- Skill is testable and reusable

## Response snapshot

Created comprehensive skill file at `.claude/skills/frontend-jwt-client/SKILL.md` (627 lines) with:

1. **Context7 Research**: Fetched latest docs for Better Auth (^1.4.0 with Bearer plugin), Next.js 16+ (App Router, async headers()), and Axios interceptor patterns
2. **Complete api.ts Implementation**: Type-safe fetch wrapper with automatic JWT attachment, 401 redirect handling, timeout support
3. **Dual Environment Support**: Client components (useSession) and server components (auth.api.getSession)
4. **Domain API Pattern**: Example tasksApi module for organized endpoint calls
5. **Testing Checklist**: 8-point verification list

Key patterns implemented:
- `api.get<T>()`, `api.post<T, TBody>()` with TypeScript generics
- Bearer token from session or localStorage fallback
- Return URL preservation on 401 redirect
- `publicApi` helper for unauthenticated endpoints
- Structured `ApiError` type

## Outcome

- Impact: Created reusable skill for generating authenticated API clients across Phase 2+ projects
- Tests: Skill includes testing checklist for manual verification
- Files: 1 file created (.claude/skills/frontend-jwt-client/SKILL.md)
- Next prompts: Use skill to generate actual frontend/lib/api.ts in Phase 2
- Reflection: Context7 MCP provided up-to-date patterns for Better Auth Bearer plugin and Next.js 16 async headers

## Evaluation notes (flywheel)

- Failure modes observed: None - Context7 resolved all library IDs successfully
- Graders run and results (PASS/FAIL): PASS - skill file validates with complete YAML frontmatter
- Prompt variant (if applicable): Research-concurrent approach (parallel MCP queries)
- Next experiment (smallest change to try): Add axios-based alternative implementation for comparison

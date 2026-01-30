---
id: 0001
title: Page Layouts Routing Specification
stage: spec
date: 2026-01-22
surface: agent
model: claude-opus-4-5-20251101
feature: 002-page-layouts
branch: 002-page-layouts
user: maira
command: /sp.specify
labels: ["ui", "pages", "routing", "phase2", "navigation", "layouts"]
links:
  spec: specs/ui/pages.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/ui/pages.md
  - specs/002-page-layouts/checklists/requirements.md
tests:
  - N/A (specification phase)
---

## Prompt

```text
@specs/ui/pages.md
@.spec-kit/config.yaml
@specs/overview.md
@specs/architecture.md

Target audience: Frontend developers implementing page layouts and routing for the Todo app Phase 2 (Next.js App Router) and hackathon judges evaluating UI completeness and professionalism

Focus: Define high-level page designs, layouts, routing structure, key sections, and content flow for all major pages (landing, auth, dashboard, task detail, settings, about) to guide responsive UI implementation

Success criteria:
- Documents all 6 main pages (landing, login/signup, dashboard, task edit modal, settings, about/architecture)
- Each page includes layout sketch (text-based), key components used, responsive adaptations, and purpose
- Routing structure clear (/dashboard, /login, /settings etc.) with auth guards (protect dashboard/settings via Better Auth session)
- Progressive enhancement noted for Phase 3+ (chatbot widget, real-time indicators)
- Judges can visualize full app navigation and page flow from document
- Implementation notes reference @specs/ui/components.md for reusable primitives

Constraints:
- Phase 2: Next.js 16+ App Router, Tailwind CSS, Shadcn UI
- Authentication handled via Better Auth (no manual Zod validation needed for login/signup forms)
- Dark theme only (professional aesthetic)
- No light mode toggle (future enhancement)
- Pages focus on task CRUD + auth + basic settings/about
- Exact file path: specs/ui/pages.md (create folder under specs/ui/ if missing)
- Use text-based ASCII sketches for layouts (no images/Figma)

Not building:
- Detailed component specs (reference @specs/ui/components.md instead)
- Phase 3+ pages (chatbot interface, voice input – separate spec)
- Advanced animations or micro-interactions (basic Framer Motion notes only)
- Full Figma/Adobe XD mockups (text descriptions + ASCII only)
- Server-side rendering specifics (focus on client-side layout)
- Custom form validation schemas (use Better Auth built-in handling for auth pages)
```

## Response snapshot

Created comprehensive Page Layouts & Routing specification at `specs/ui/pages.md` containing:

1. **Application Overview**: 6-page inventory with route mapping and auth requirements
2. **Routing Structure**: Complete route map with App Router file structure, public/protected route groups
3. **Page Specifications**: Detailed layouts for all 6 pages:
   - Landing Page: Hero section, features grid, CTA, desktop/mobile ASCII layouts
   - Login Page: Two-column auth form, OAuth providers, error states
   - Signup Page: Registration form with password strength indicator
   - Dashboard: Task list with tabs, filters, grouping, task edit modal
   - Settings Page: Sidebar navigation with sub-sections
   - About Page: Project overview, phase timeline, tech stack, architecture diagram
4. **Shared Layouts**: Root, public, and protected layout wrappers
5. **Navigation Flow**: User journey map with visual diagram
6. **Authentication Guards**: Route protection matrix and redirect behavior
7. **Progressive Enhancement**: Phase 3+ placeholders for chatbot widget, real-time indicators
8. **User Scenarios**: 6 user stories with 14 acceptance scenarios
9. **Requirements**: 10 functional requirements (FR-001 to FR-010)
10. **Success Criteria**: 8 measurable outcomes (SC-001 to SC-008)

Created validation checklist at `specs/002-page-layouts/checklists/requirements.md` - all 16 items passed.

## Outcome

- ✅ Impact: Complete page layouts and routing specification ready for Phase 2 implementation
- 🧪 Tests: N/A (specification phase - no code tests)
- 📁 Files: 2 files created (spec + checklist)
- 🔁 Next prompts: `/sp.plan` to create implementation plan
- 🧠 Reflection: Spec provides comprehensive page-by-page layouts with responsive breakpoints, clear routing structure, and auth guard requirements. ASCII diagrams allow judges to visualize complete app navigation.

## Evaluation notes (flywheel)

- Failure modes observed: None - all checklist items passed on first validation
- Graders run and results (PASS/FAIL): requirements.md checklist - PASS (16/16 items)
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): Consider adding error page layouts (500, maintenance mode) in future iteration

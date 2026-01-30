# Tasks: Authentication (Phase 2)

**Feature**: Authentication
**Spec Reference**: @specs/features/authentication/spec.md
**Plan Reference**: @specs/features/authentication/plan.md
**Created**: 2026-01-19
**Updated**: 2026-01-29

## Changes Summary (2026-01-29)

- Fixed 401 errors on dashboard API calls by improving token attachment
- Added token caching and retry logic in api-client.ts
- Fixed auto-redirect after signup using window.location.href
- Added session_expired query param handling on login page
- Updated signout to clear JWT token cache
- Backend JWT middleware now prioritizes HS256 (avoids JWKS errors)
- Added debug logging throughout auth flow

### Previous Changes (2026-01-26)

- Added database migration tasks for Better Auth tables (user, session, account, verification)
- Added explicit HS256 JWT configuration tasks
- Added pg Pool adapter setup tasks
- Added token attachment to API client tasks
- Added client vs server component guidance in task descriptions
- Updated task descriptions with exact file paths and code patterns
- Reordered tasks to match plan.md phases (A through G)

---

## User Stories Mapping

| Story | Priority | Description |
|-------|----------|-------------|
| US1 | P1 | User Registration (signup with email/password) |
| US2 | P1 | User Sign In (authenticate with credentials) |
| US3 | P1 | Authenticated API Access (JWT verification, token attachment) |
| US4 | P2 | Task Ownership & User Isolation (user_id filtering) |
| US5 | P3 | Sign Out (clear session, redirect) |

---

## Phase 1: Setup (Environment & Dependencies)

**Purpose**: Environment configuration and dependency installation

### Environment Setup

- [ ] T001 Generate BETTER_AUTH_SECRET: run `openssl rand -base64 32` and save output
- [ ] T002 Create/update `frontend/.env.local` with DATABASE_URL, BETTER_AUTH_SECRET, BETTER_AUTH_URL, NEXT_PUBLIC_API_URL
- [ ] T003 [P] Create/update `backend/.env` with DATABASE_URL, BETTER_AUTH_SECRET, HOST, PORT
- [ ] T004 Verify BETTER_AUTH_SECRET is identical in both `.env` files (at least 32 characters)

### Dependency Installation

- [ ] T005 [P] Install frontend dependencies: `cd frontend && npm install better-auth pg`
- [ ] T006 [P] Install backend dependencies: `cd backend && pip install pyjwt python-dotenv`

---

## Phase 2: Database Setup (Migration Tables)

**Purpose**: Create required Better Auth tables before first signup

**CRITICAL**: These tables MUST exist before any auth operations

### Auth Tables Migration

- [ ] T007 Create migration file `database/migrations/001_auth_tables.sql` with user, session, account, verification tables (see data-model.md for exact schema)
- [ ] T008 Run migration against PostgreSQL database (Neon SQL Editor or psql)
- [ ] T009 Verify tables exist: run `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('user', 'session', 'account', 'verification');` - expect 4 rows

**Checkpoint**: Database ready for Better Auth

---

## Phase 3: Frontend Auth Instance (Foundational)

**Purpose**: Core Better Auth configuration with pg Pool + HS256 JWT

**CRITICAL**: Must use HS256 algorithm and pg Pool adapter

### Server-Side Auth Instance

- [ ] T010 Create `frontend/lib/auth.ts` with betterAuth() configuration:
  - Import Pool from "pg" and create connection with DATABASE_URL
  - Import jwt from "better-auth/plugins"
  - Configure database: pool
  - Configure emailAndPassword: { enabled: true }
  - Configure session.cookieCache: { enabled: true }
  - Configure jwt plugin with definePayload returning { sub: user.id, email: user.email }

### Client-Side Auth Client

- [ ] T011 Create `frontend/lib/auth-client.ts` with createAuthClient():
  - Import createAuthClient from "better-auth/react"
  - Set baseURL to NEXT_PUBLIC_BETTER_AUTH_URL or "http://localhost:3000"
  - Export authClient

### Auth API Route Handler

- [ ] T012 Create `frontend/app/api/auth/[...all]/route.ts`:
  - Import auth from "@/lib/auth"
  - Export GET and POST from auth.handler

### Verification

- [ ] T013 Start frontend and test: `curl http://localhost:3000/api/auth/session` should return `{"session":null,"user":null}`

**Checkpoint**: Frontend auth instance ready

---

## Phase 4: User Story 1 - User Registration (Priority: P1) - MVP

**Goal**: New users can sign up with email/password and auto-signin

**Independent Test**: Submit signup form → user created in database → session established → redirect to dashboard

### Auth UI Layout

- [ ] T014 [US1] Create auth layout `frontend/app/(auth)/layout.tsx` (no navbar, centered card)

### Signup Form (Client Component)

- [ ] T015 [P] [US1] Create `frontend/lib/auth-errors.ts` with parseAuthError() function mapping error codes to user-friendly messages (USER_ALREADY_EXISTS, INVALID_EMAIL, PASSWORD_TOO_SHORT)
- [ ] T016 [US1] Create signup form `frontend/components/auth/signup-form.tsx`:
  - Add "use client" directive at top
  - Import authClient from "@/lib/auth-client"
  - Import useRouter from "next/navigation"
  - Form fields: name, email, password (min 8 chars)
  - Call authClient.signUp.email({ email, password, name })
  - On success: router.push("/dashboard")
  - On error: display parsed error message

### Signup Page

- [ ] T017 [US1] Create signup page `frontend/app/(auth)/signup/page.tsx` using SignupForm component

**Checkpoint**: User Story 1 complete - new users can register

---

## Phase 5: User Story 2 - User Sign In (Priority: P1)

**Goal**: Existing users can authenticate and receive session

**Independent Test**: Submit signin form → session established → redirect to dashboard

### Signin Form (Client Component)

- [ ] T018 [P] [US2] Create signin form `frontend/components/auth/signin-form.tsx`:
  - Add "use client" directive at top
  - Import authClient from "@/lib/auth-client"
  - Import useRouter from "next/navigation"
  - Form fields: email, password
  - Call authClient.signIn.email({ email, password })
  - On success: router.push("/dashboard")
  - On error: display generic "Invalid email or password" (no field-specific hints)

### Signin Page

- [ ] T019 [US2] Create signin page `frontend/app/(auth)/signin/page.tsx` using SigninForm component

### Auth Page Links

- [ ] T020 [P] [US2] Add link to signup page from signin ("Don't have an account? Sign up")
- [ ] T021 [P] [US2] Add link to signin page from signup ("Already have an account? Sign in")

**Checkpoint**: User Story 2 complete - users can sign in

---

## Phase 6: User Story 3 - Authenticated API Access (Priority: P1)

**Goal**: JWT token attached to API calls, backend verifies tokens

**Independent Test**: API call with valid JWT → 200; API call without JWT → 401

### Token Attachment (Frontend)

- [ ] T022 [US3] Create API client `frontend/lib/api-client.ts`:
  - Import authClient from "@/lib/auth-client"
  - Create apiClient() async function that:
    - Calls authClient.getSession()
    - Throws "Not authenticated" if no session.session.token
    - Creates Headers with Authorization: Bearer ${token}
    - Calls fetch with NEXT_PUBLIC_API_URL + endpoint

### Protected Layout (Server Component)

- [ ] T023 [US3] Create protected layout `frontend/app/(protected)/layout.tsx`:
  - Import auth from "@/lib/auth"
  - Import headers from "next/headers"
  - Import redirect from "next/navigation"
  - Call auth.api.getSession({ headers: await headers() })
  - If no session: redirect("/signin")
  - Return children

### Dashboard Page

- [ ] T024 [US3] Create dashboard page `frontend/app/(protected)/dashboard/page.tsx`:
  - Display user email from session
  - Placeholder for task list

### Backend JWT Middleware

- [ ] T025 [US3] Add BETTER_AUTH_SECRET loading in `backend/src/core/config.py` (from environment variable)
- [ ] T026 [US3] Create JWT verification middleware `backend/src/api/middleware/auth.py`:
  - Import jwt from pyjwt
  - Import HTTPBearer, HTTPAuthorizationCredentials from fastapi.security
  - Create get_current_user dependency that:
    - Extracts token from Authorization header
    - Decodes with jwt.decode(token, BETTER_AUTH_SECRET, algorithms=["HS256"])
    - Returns user_id from payload["sub"]
    - Raises HTTPException(401) for ExpiredSignatureError, InvalidTokenError

### Apply Auth to Routes

- [ ] T027 [US3] Apply auth middleware to task routes in `backend/src/api/routes/tasks.py`:
  - Add Depends(get_current_user) to route functions
  - Inject user_id parameter

**Checkpoint**: User Story 3 complete - authenticated API access working

---

## Phase 7: User Story 4 - Task Ownership & User Isolation (Priority: P2)

**Goal**: Users can only see and modify their own tasks

**Independent Test**: User A creates tasks → User B cannot see/modify them

### Task Model Extension

- [ ] T028 [US4] Add user_id field to Task model in `backend/src/models/task.py`:
  - Field type: str (TEXT to match Better Auth user.id)
  - Foreign key reference: user.id
  - Not nullable

### Database Migration

- [ ] T029 [US4] Create migration file `database/migrations/002_task_user_id.sql`:
  - ALTER TABLE task ADD COLUMN user_id TEXT REFERENCES "user"(id) ON DELETE CASCADE
  - CREATE INDEX idx_task_user_id ON task(user_id)
- [ ] T030 [US4] Run migration against PostgreSQL database

### Task Service Updates

- [ ] T031 [US4] Update task service `backend/src/services/task_service.py`:
  - All list queries filter by user_id
  - Create auto-assigns user_id from authenticated user
  - Get/Update/Delete verify ownership, return None if not owner

### Task Route Updates

- [ ] T032 [US4] Update task routes `backend/src/api/routes/tasks.py`:
  - Pass user_id to service methods
  - Return 404 (not 403) when accessing other user's task

**Checkpoint**: User Story 4 complete - full user isolation

---

## Phase 8: User Story 5 - Sign Out (Priority: P3)

**Goal**: Users can securely end their session

**Independent Test**: Click signout → token cleared → API calls return 401 → redirected to signin

### Signout Button (Client Component)

- [ ] T033 [P] [US5] Create signout button `frontend/components/auth/signout-button.tsx`:
  - Add "use client" directive at top
  - Import authClient from "@/lib/auth-client"
  - Import useRouter from "next/navigation"
  - On click: await authClient.signOut(), then router.push("/signin")

### Integrate Signout

- [ ] T034 [US5] Add SignoutButton to dashboard page in `frontend/app/(protected)/dashboard/page.tsx`

**Checkpoint**: User Story 5 complete - users can sign out

---

## Phase 9: Polish & Validation

**Purpose**: Quality improvements and acceptance criteria validation

### UI Polish

- [ ] T035 [P] Add loading states to signin/signup forms (disable button, show spinner)
- [ ] T036 [P] Add form validation feedback (email format, password length)
- [ ] T037 [P] Display current user email in dashboard header

### Security Logging (Optional for MVP)

- [ ] T038 [P] Create auth logger `backend/src/services/auth_logger.py` with structured JSON output
- [ ] T039 [P] Log signup/signin/signout events with timestamp, email, outcome

### Rate Limiting (Optional for MVP)

- [ ] T040 [P] Create rate limiter `backend/src/api/middleware/rate_limit.py` (in-memory, 5 attempts per 15 min)
- [ ] T041 Apply rate limiter to signin endpoint

### Validation

- [ ] T042 Run through Implementation Checklist from spec.md
- [ ] T043 Verify all 4 auth tables exist in database
- [ ] T044 Verify BETTER_AUTH_SECRET matches in both .env files
- [ ] T045 Test full flow: signup → dashboard → signout → signin → dashboard
- [ ] T046 Test user isolation: User A tasks not visible to User B

---

## Dependencies & Execution Order

### Phase Dependencies

```
Phase 1 (Setup) ─────────────────────────────────────▶ No dependencies
     │
     ▼
Phase 2 (Database) ──────────────────────────────────▶ Depends on Setup
     │
     ▼
Phase 3 (Frontend Auth) ─────────────────────────────▶ Depends on Database
     │
     ├─────────────────┬─────────────────┐
     ▼                 ▼                 ▼
Phase 4 (US1)    Phase 5 (US2)    Phase 6 (US3)     Can run in parallel
Registration     Sign In          API Access
     │                 │                 │
     └─────────────────┴─────────────────┘
                       │
                       ▼
               Phase 7 (US4) ────────────────────────▶ Depends on US1-3
               Task Ownership
                       │
                       ▼
               Phase 8 (US5) ────────────────────────▶ Can parallel with US4
               Sign Out
                       │
                       ▼
               Phase 9 (Polish) ─────────────────────▶ After all stories
```

### Critical Path (MVP)

**Minimum path to working auth**: T001-T013, T014-T017, T018-T021, T022-T027

Total: 27 tasks for basic signup/signin/protected routes

---

## Parallel Execution Examples

### Phase 1 Parallel Group
```bash
# Run together:
T002: frontend/.env.local
T003: backend/.env
T005: npm install
T006: pip install
```

### Phase 4-6 Parallel (after Phase 3)
```bash
# US1, US2, US3 can run in parallel:
Developer A: T014-T017 (Registration)
Developer B: T018-T021 (Sign In)
Developer C: T022-T027 (API Access)
```

### Phase 9 Polish Parallel
```bash
# All marked [P] can run together:
T035: Loading states
T036: Form validation
T037: User display
T038: Auth logger
T039: Log events
T040: Rate limiter
```

---

## Implementation Strategy

### MVP First (Phases 1-6)

1. Complete Phase 1: Setup (T001-T006)
2. Complete Phase 2: Database (T007-T009)
3. Complete Phase 3: Frontend Auth (T010-T013)
4. Complete Phase 4: Registration (T014-T017)
5. Complete Phase 5: Sign In (T018-T021)
6. Complete Phase 6: API Access (T022-T027)
7. **STOP and VALIDATE**: Test full auth flow
8. Deploy/demo if ready

### Full Feature Delivery

9. Add Phase 7: Task Ownership (T028-T032)
10. Add Phase 8: Sign Out (T033-T034)
11. Complete Phase 9: Polish (T035-T046)
12. Final validation against acceptance criteria

---

## Summary

| Metric | Value |
|--------|-------|
| Total Tasks | 46 |
| Setup Phase | 6 tasks |
| Database Phase | 3 tasks |
| Frontend Auth Phase | 4 tasks |
| US1 (Registration) | 4 tasks |
| US2 (Sign In) | 4 tasks |
| US3 (API Access) | 6 tasks |
| US4 (Ownership) | 5 tasks |
| US5 (Sign Out) | 2 tasks |
| Polish Phase | 12 tasks |
| Parallel Opportunities | 15 tasks marked [P] |
| MVP Scope | Phases 1-6 (27 tasks) |

---

## Notes

- [P] tasks = different files, no dependencies, can run in parallel
- [US#] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate independently
- **Critical**: Always verify BETTER_AUTH_SECRET match before testing auth flow

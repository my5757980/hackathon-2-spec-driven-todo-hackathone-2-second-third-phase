# Tasks: Task Recurring & Due Dates Reminders

**Input**: Design documents from `specs/features/task-recurring-Due-Dates-and-reminders/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/cli-interface.md, quickstart.md
**Branch**: `003-task-recurring-due-dates-reminders`
**Generated**: 2026-01-18

**Tests**: Manual test checklist included per constitution (Phase 1). No pytest tests required unless explicitly requested.

**Organization**: Tasks grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, etc.)
- All file paths are relative to repository root

## Path Conventions

Single project structure per plan.md:
- Source: `src/` at repository root
- Tests: `tests/` at repository root

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create new files and extend existing infrastructure for recurring/due dates feature

- [X] T001 Create RecurringInterval enum in src/models/recurring_interval.py
- [X] T002 [P] Create date_utils module in src/core/date_utils.py with add_interval function
- [X] T003 [P] Create validators module in src/core/validators.py with reminder offset parsing

**Checkpoint**: Core utilities ready for feature implementation ✅

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Extend Task model with new fields - MUST complete before any user story

**⚠️ CRITICAL**: All user stories depend on the extended Task model

- [X] T004 Extend Task model in src/models/task.py with due_date, recurring_interval, reminder_offset, parent_task_id fields
- [X] T005 Update task model imports to include RecurringInterval enum in src/models/__init__.py

**Checkpoint**: Task model ready with all new fields - user story implementation can begin ✅

---

## Phase 3: User Story 1 - Create Recurring Tasks (Priority: P1) 🎯 MVP

**Goal**: Users can create tasks with recurring intervals (daily, weekly, monthly)

**Independent Test**: `todo add "Test task" --recurring weekly` creates task with recurring_interval=weekly

### Implementation for User Story 1

- [X] T006 [US1] Add --recurring option to add command in src/cli/commands.py
- [X] T007 [US1] Implement recurring interval validation in src/core/validators.py
- [X] T008 [US1] Update TaskService.create_task to accept recurring_interval in src/services/task_service.py
- [X] T009 [US1] Update success message to include recurrence info in src/cli/commands.py

**Checkpoint**: Users can create recurring tasks via CLI ✅

---

## Phase 4: User Story 2 - Set Due Dates (Priority: P1) 🎯 MVP

**Goal**: Users can assign due dates (with optional time) to tasks

**Independent Test**: `todo add "Test" --due 2026-01-25` creates task with due_date set

### Implementation for User Story 2

- [X] T010 [US2] Add parse_due_date function in src/core/validators.py
- [X] T011 [US2] Add --due option to add command in src/cli/commands.py
- [X] T012 [US2] Update TaskService.create_task to accept due_date in src/services/task_service.py
- [X] T013 [US2] Add past date warning logic in src/cli/commands.py
- [X] T014 [US2] Update success message to include due date info in src/cli/commands.py

**Checkpoint**: Users can create tasks with due dates via CLI ✅

---

## Phase 5: User Story 3 - Set Reminders (Priority: P2)

**Goal**: Users can set reminder offsets before due date

**Independent Test**: `todo add "Test" --due 2026-01-25 --remind 1d` creates task with reminder_offset=1d

### Implementation for User Story 3

- [X] T015 [US3] Add --remind option to add command in src/cli/commands.py
- [X] T016 [US3] Implement reminder validation (requires due_date) in src/core/validators.py
- [X] T017 [US3] Update TaskService.create_task to accept reminder_offset in src/services/task_service.py
- [X] T018 [US3] Update success message to include reminder info in src/cli/commands.py

**Checkpoint**: Users can create tasks with reminders via CLI ✅

---

## Phase 6: User Story 4 - Auto-Reschedule on Completion (Priority: P1) 🎯 MVP

**Goal**: Completing a recurring task automatically creates the next instance

**Independent Test**: Complete a recurring task and verify new task is created with advanced due date

### Implementation for User Story 4

- [X] T019 [US4] Create recurring_service module in src/services/recurring_service.py
- [X] T020 [US4] Implement create_next_occurrence function in src/services/recurring_service.py
- [X] T021 [US4] Extend complete command to check for recurring tasks in src/cli/commands.py
- [X] T022 [US4] Integrate RecurringService with TaskService.complete_task in src/services/task_service.py
- [X] T023 [US4] Update complete command output for recurring tasks in src/cli/commands.py

**Checkpoint**: Recurring tasks auto-create next instance on completion ✅

---

## Phase 7: User Story 5 - Stop/Modify Recurrence (Priority: P2)

**Goal**: Users can stop or change recurrence pattern via update command

**Independent Test**: `todo update 1 --recurring none` stops recurrence; `todo update 1 --recurring monthly` changes interval

### Implementation for User Story 5

- [X] T024 [US5] Add --recurring option to update command in src/cli/commands.py
- [X] T025 [US5] Add --due option to update command in src/cli/commands.py
- [X] T026 [US5] Add --remind option to update command in src/cli/commands.py
- [X] T027 [US5] Implement TaskService.update_task extensions in src/services/task_service.py
- [X] T028 [US5] Handle "none" value for removing recurrence/due date in src/cli/commands.py
- [X] T029 [US5] Update output messages for recurrence changes in src/cli/commands.py

**Checkpoint**: Users can modify recurring/due/reminder settings on existing tasks ✅

---

## Phase 8: User Story 6 - Filter/Sort by Due Date (Priority: P2)

**Goal**: Users can filter tasks by today/week/overdue and sort by due date

**Independent Test**: `todo list --due today` shows only today's tasks; `todo list --sort due` sorts by due date

### Implementation for User Story 6

- [X] T030 [US6] Add --due filter option (today/week/overdue) to list command in src/cli/commands.py
- [X] T031 [US6] Add --sort due option to list command in src/cli/commands.py
- [X] T032 [US6] Implement due date filtering logic in src/services/task_service.py
- [X] T033 [US6] Implement due date sorting logic in src/services/task_service.py
- [X] T034 [US6] Update list output to show Due and Recurring columns in src/cli/commands.py
- [X] T035 [US6] Add overdue indicator (*) to list output in src/cli/commands.py

**Checkpoint**: Users can filter and sort tasks by due date ✅

---

## Phase 9: User Story 7 - View Upcoming Reminders (Priority: P3)

**Goal**: Users can view upcoming reminders for the next 24 hours

**Independent Test**: `todo list --reminders` shows tasks with reminders due soon

### Implementation for User Story 7

- [X] T036 [US7] Create reminder_service module in src/services/reminder_service.py
- [X] T037 [US7] Implement get_upcoming_reminders function in src/services/reminder_service.py
- [X] T038 [US7] Add --reminders flag to list command in src/cli/commands.py
- [X] T039 [US7] Format reminder output display in src/cli/commands.py

**Checkpoint**: Users can view upcoming reminders via CLI ✅

---

## Phase 10: Polish & Cross-Cutting Concerns

**Purpose**: Final integration, validation, and manual testing

- [X] T040 Update src/services/__init__.py exports for new services
- [X] T041 Update src/core/__init__.py exports for validators and date_utils
- [X] T042 [P] Create manual test checklist in tests/manual/phase1-recurring-checklist.md
- [X] T043 Run quickstart.md validation scenarios
- [X] T044 Verify existing task-crud and priorities features still work (regression check)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup - BLOCKS all user stories
- **User Stories (Phase 3-9)**: All depend on Foundational phase completion
- **Polish (Phase 10)**: Depends on all user stories being complete

### User Story Dependencies

```
Phase 2 (Foundational) ──┬──> Phase 3 (US1: Create Recurring) ─────────┐
                         │                                              │
                         ├──> Phase 4 (US2: Due Dates) ────────────────┤
                         │                                              │
                         ├──> Phase 5 (US3: Reminders) ────────────────┤──> Phase 10 (Polish)
                         │         └── depends on US2 (due_date)       │
                         │                                              │
                         ├──> Phase 6 (US4: Auto-Reschedule) ──────────┤
                         │         └── depends on US1 (recurring)      │
                         │                                              │
                         ├──> Phase 7 (US5: Stop/Modify) ──────────────┤
                         │         └── depends on US1, US2, US3        │
                         │                                              │
                         ├──> Phase 8 (US6: Filter/Sort) ──────────────┤
                         │         └── depends on US2 (due_date)       │
                         │                                              │
                         └──> Phase 9 (US7: Reminders View) ───────────┘
                                   └── depends on US3 (reminders)
```

### MVP Path (Minimum Viable Product)

Complete these phases for MVP:
1. Phase 1: Setup
2. Phase 2: Foundational
3. Phase 3: US1 - Create Recurring Tasks
4. Phase 4: US2 - Set Due Dates
5. Phase 6: US4 - Auto-Reschedule (core recurring functionality)

**MVP delivers**: Create recurring tasks with due dates that auto-reschedule on completion.

### Recommended Execution Order

**Sequential approach (single developer):**
1. Setup → Foundational → US1 → US2 → US4 (MVP complete!)
2. Then: US3 → US5 → US6 → US7 → Polish

### Within Each User Story

- Validators/parsers before services
- Services before CLI commands
- Core logic before output formatting
- Commit after each task or logical group

### Parallel Opportunities

**Within Setup (Phase 1):**
```
T001 (enum)
T002 (date_utils) ─┬─ These can run in parallel
T003 (validators) ─┘
```

**After Foundational, these user stories can run in parallel:**
- US1 (recurring) and US2 (due dates) are independent
- US4 depends on US1
- US3 depends on US2
- US6 depends on US2
- US7 depends on US3

---

## Parallel Example: Setup Phase

```bash
# Launch all setup tasks together:
Task T001: "Create RecurringInterval enum in src/models/recurring_interval.py"
Task T002: "Create date_utils module in src/core/date_utils.py"
Task T003: "Create validators module in src/core/validators.py"
```

## Parallel Example: After Foundational

```bash
# US1 and US2 can be worked on simultaneously:
Developer A: Phase 3 (US1 - Recurring Tasks)
Developer B: Phase 4 (US2 - Due Dates)
```

---

## Implementation Strategy

### MVP First (Phases 1-2-3-4-6)

1. Complete Phase 1: Setup (T001-T003)
2. Complete Phase 2: Foundational (T004-T005)
3. Complete Phase 3: US1 - Create Recurring (T006-T009)
4. Complete Phase 4: US2 - Set Due Dates (T010-T014)
5. Complete Phase 6: US4 - Auto-Reschedule (T019-T023)
6. **STOP and VALIDATE**: Test MVP independently
7. Deploy/demo if ready

### Incremental Delivery

1. Setup + Foundational → Infrastructure ready
2. Add US1 + US2 → Create tasks with recurring/due ✓
3. Add US4 → Auto-reschedule works ✓ (MVP!)
4. Add US3 → Reminders supported ✓
5. Add US5 → Update commands work ✓
6. Add US6 → Filtering/sorting works ✓
7. Add US7 → Reminders view works ✓
8. Polish → Production ready ✓

---

## Task Summary

| Phase | Description | Tasks | Parallelizable |
|-------|-------------|-------|----------------|
| 1 | Setup | T001-T003 (3) | 2 of 3 |
| 2 | Foundational | T004-T005 (2) | 0 |
| 3 | US1: Create Recurring | T006-T009 (4) | 0 |
| 4 | US2: Due Dates | T010-T014 (5) | 0 |
| 5 | US3: Reminders | T015-T018 (4) | 0 |
| 6 | US4: Auto-Reschedule | T019-T023 (5) | 0 |
| 7 | US5: Stop/Modify | T024-T029 (6) | 0 |
| 8 | US6: Filter/Sort | T030-T035 (6) | 0 |
| 9 | US7: Reminders View | T036-T039 (4) | 0 |
| 10 | Polish | T040-T044 (5) | 1 of 5 |
| **Total** | | **44 tasks** | **3 parallelizable** |

---

## Notes

- Tasks reference spec.md user stories via [US#] labels
- Each user story is independently testable after completion
- MVP scope: US1 + US2 + US4 (14 tasks after foundational)
- Commit messages should reference: `@specs/features/task-recurring-Due-Dates-and-reminders/spec.md`
- All code must include header: `# Generated from @specs/features/task-recurring-Due-Dates-and-reminders/spec.md`

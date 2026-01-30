# Tasks: Task Priorities, Search, and Sorting

**Input**: Design documents from `@specs/features/task-priorities-search-sorting/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/cli-interface.md

**Tests**: Tests are included as this feature extends existing task-crud functionality and needs verification.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

Based on plan.md structure:
- **Source**: `src/models/`, `src/services/`, `src/cli/`, `src/core/`
- **Tests**: `tests/unit/`, `tests/integration/`, `tests/manual/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and extension of existing task-crud structure

- [ ] T001 Verify existing task-crud implementation works in src/
- [ ] T002 [P] Create Priority enum in src/models/priority.py
- [ ] T003 [P] Create validators module in src/core/validators.py

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before user story implementation

**⚠️ CRITICAL**: All user stories depend on the extended Task model

- [ ] T004 Extend Task model with priority field (default: MEDIUM) in src/models/task.py
- [ ] T005 Extend Task model with tags field (default: []) in src/models/task.py
- [ ] T006 Implement priority validation in src/core/validators.py
- [ ] T007 Implement tag validation (alphanumeric + hyphen, 1-50 chars) in src/core/validators.py
- [ ] T008 [P] Update list output format to include Priority and Tags columns in src/cli/commands.py
- [ ] T009 [P] Create manual test checklist template in tests/manual/phase1-checklist.md

**Checkpoint**: Extended Task model ready - user story implementation can begin

---

## Phase 3: User Story 1 - Assign Priority to Task (Priority: P1) 🎯 MVP

**Goal**: Users can assign high/medium/low priority levels when creating or updating tasks

**Independent Test**: Create task with `--priority high`, run `list`, verify priority displays correctly

### Tests for User Story 1

- [ ] T010 [P] [US1] Unit test for Priority enum in tests/unit/test_priority.py
- [ ] T011 [P] [US1] Unit test for priority validation in tests/unit/test_validators.py

### Implementation for User Story 1

- [ ] T012 [US1] Add --priority option to add command in src/cli/commands.py
- [ ] T013 [US1] Add --priority option to update command in src/cli/commands.py
- [ ] T014 [US1] Handle priority in task creation output message in src/cli/commands.py
- [ ] T015 [US1] Add priority validation error handling in src/cli/commands.py

**Checkpoint**: Priority assignment works - users can create/update tasks with priorities

---

## Phase 4: User Story 2 - Assign Tags to Task (Priority: P1)

**Goal**: Users can assign one or more tags for flexible task categorization

**Independent Test**: Create task with `--tag work --tag urgent`, run `list`, verify tags display

### Tests for User Story 2

- [ ] T016 [P] [US2] Unit test for tag validation in tests/unit/test_validators.py
- [ ] T017 [P] [US2] Unit test for tag normalization (lowercase, trim) in tests/unit/test_validators.py

### Implementation for User Story 2

- [ ] T018 [US2] Add --tag option (multiple=True) to add command in src/cli/commands.py
- [ ] T019 [US2] Add --tag option (multiple=True) to update command in src/cli/commands.py
- [ ] T020 [US2] Handle tags in task creation output message in src/cli/commands.py
- [ ] T021 [US2] Add tag validation error handling in src/cli/commands.py

**Checkpoint**: Tag assignment works - users can create/update tasks with tags

---

## Phase 5: User Story 3 - Search Tasks by Keyword (Priority: P2)

**Goal**: Users can search tasks by keyword in title and description

**Independent Test**: Create tasks, run `search "meeting"`, verify only matching tasks appear

### Tests for User Story 3

- [ ] T022 [P] [US3] Unit test for search function in tests/unit/test_task_service.py
- [ ] T023 [P] [US3] Unit test for case-insensitive matching in tests/unit/test_task_service.py

### Implementation for User Story 3

- [ ] T024 [US3] Create search function in src/services/task_service.py
- [ ] T025 [US3] Implement case-insensitive substring matching in src/services/task_service.py
- [ ] T026 [US3] Add search command to CLI in src/cli/commands.py
- [ ] T027 [US3] Handle empty search term error in src/cli/commands.py
- [ ] T028 [US3] Handle no results message in src/cli/commands.py

**Checkpoint**: Search works - users can find tasks by keyword

---

## Phase 6: User Story 4 - Filter Tasks by Status (Priority: P2)

**Goal**: Users can filter task list by completion status (pending/completed)

**Independent Test**: Have mixed status tasks, run `list --status pending`, verify only pending shown

### Tests for User Story 4

- [ ] T029 [P] [US4] Unit test for status filter function in tests/unit/test_task_service.py

### Implementation for User Story 4

- [ ] T030 [US4] Create filter_by_status function in src/services/task_service.py
- [ ] T031 [US4] Add --status option to list command in src/cli/commands.py
- [ ] T032 [US4] Handle no matching status message in src/cli/commands.py

**Checkpoint**: Status filter works - users can view pending or completed tasks only

---

## Phase 7: User Story 5 - Filter Tasks by Priority (Priority: P2)

**Goal**: Users can filter task list by priority level(s)

**Independent Test**: Have tasks with different priorities, run `list --priority high`, verify filter works

### Tests for User Story 5

- [ ] T033 [P] [US5] Unit test for priority filter function in tests/unit/test_task_service.py
- [ ] T034 [P] [US5] Unit test for multiple priority filter (OR logic) in tests/unit/test_task_service.py

### Implementation for User Story 5

- [ ] T035 [US5] Create filter_by_priority function in src/services/task_service.py
- [ ] T036 [US5] Add --priority option (multiple=True) to list command filter in src/cli/commands.py
- [ ] T037 [US5] Handle no matching priority message in src/cli/commands.py

**Checkpoint**: Priority filter works - users can view tasks by priority

---

## Phase 8: User Story 6 - Filter Tasks by Tag (Priority: P2)

**Goal**: Users can filter task list by tag(s)

**Independent Test**: Have tasks with different tags, run `list --tag work`, verify filter works

### Tests for User Story 6

- [ ] T038 [P] [US6] Unit test for tag filter function in tests/unit/test_task_service.py
- [ ] T039 [P] [US6] Unit test for multiple tag filter (OR logic) in tests/unit/test_task_service.py

### Implementation for User Story 6

- [ ] T040 [US6] Create filter_by_tag function in src/services/task_service.py
- [ ] T041 [US6] Add --tag option (multiple=True) to list command filter in src/cli/commands.py
- [ ] T042 [US6] Handle no matching tag message in src/cli/commands.py

**Checkpoint**: Tag filter works - users can view tasks by tag

---

## Phase 9: User Story 7 - Sort Tasks (Priority: P3)

**Goal**: Users can sort task list by priority, title, or creation date

**Independent Test**: Have multiple tasks, run `list --sort priority`, verify sort order

### Tests for User Story 7

- [ ] T043 [P] [US7] Unit test for sort by priority in tests/unit/test_task_service.py
- [ ] T044 [P] [US7] Unit test for sort by title in tests/unit/test_task_service.py
- [ ] T045 [P] [US7] Unit test for sort order (asc/desc) in tests/unit/test_task_service.py

### Implementation for User Story 7

- [ ] T046 [US7] Create sort_tasks function with key functions in src/services/task_service.py
- [ ] T047 [US7] Add --sort option to list command in src/cli/commands.py
- [ ] T048 [US7] Add --order option (asc/desc) to list command in src/cli/commands.py
- [ ] T049 [US7] Set default sort to created date ascending in src/cli/commands.py

**Checkpoint**: Sorting works - users can sort by priority, title, or created

---

## Phase 10: User Story 8 - Combine Filters and Sort (Priority: P3)

**Goal**: Users can combine multiple filters and sorting for custom views

**Independent Test**: Run `list --status pending --priority high --sort title`, verify combined result

### Tests for User Story 8

- [ ] T050 [P] [US8] Unit test for combined filter function in tests/unit/test_task_service.py
- [ ] T051 [P] [US8] Integration test for CLI with combined options in tests/integration/test_cli_commands.py

### Implementation for User Story 8

- [ ] T052 [US8] Create combined filter/sort function in src/services/task_service.py
- [ ] T053 [US8] Wire all filter and sort options together in list command in src/cli/commands.py
- [ ] T054 [US8] Handle AND logic between filter types, OR within same type in src/services/task_service.py
- [ ] T055 [US8] Handle generic "No tasks found matching your criteria" message in src/cli/commands.py

**Checkpoint**: Combined filters work - users get fully customized task views

---

## Phase 11: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T056 [P] Complete manual test checklist in tests/manual/phase1-checklist.md
- [ ] T057 [P] Update quickstart.md with verification steps in specs/features/task-priorities-search-sorting/quickstart.md
- [ ] T058 Validate backward compatibility with task-crud commands
- [ ] T059 [P] Add code header comments referencing @specs/features/task-priorities-search-sorting/spec.md
- [ ] T060 Performance test: verify <500ms for 1000 tasks
- [ ] T061 Run ruff check and ruff format on all modified files

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup - BLOCKS all user stories
- **User Stories 1-2 (P1)**: Depend on Foundational - Core features
- **User Stories 3-6 (P2)**: Depend on Foundational - Can run in parallel
- **User Stories 7-8 (P3)**: Depend on Foundational - Can run in parallel with P2
- **Polish (Phase 11)**: Depends on all user stories being complete

### User Story Dependencies

| Story | Priority | Depends On | Can Parallelize With |
|-------|----------|------------|----------------------|
| US1 - Priority | P1 | Foundational | US2 |
| US2 - Tags | P1 | Foundational | US1 |
| US3 - Search | P2 | Foundational | US4, US5, US6 |
| US4 - Status Filter | P2 | Foundational | US3, US5, US6 |
| US5 - Priority Filter | P2 | US1 (for priority data) | US3, US4, US6 |
| US6 - Tag Filter | P2 | US2 (for tag data) | US3, US4, US5 |
| US7 - Sort | P3 | Foundational | US8 |
| US8 - Combined | P3 | US3, US4, US5, US6, US7 | None |

### Within Each User Story

1. Tests (marked [P]) can run in parallel
2. Tests before implementation
3. Service layer before CLI layer
4. Core implementation before error handling

---

## Parallel Opportunities

### Phase 1 (Setup)

```bash
# Can run in parallel:
T002: Create Priority enum in src/models/priority.py
T003: Create validators module in src/core/validators.py
```

### Phase 2 (Foundational)

```bash
# After T004, T005 complete:
T008: Update list output format
T009: Create manual test checklist template
```

### User Story Tests

```bash
# All tests within a story can run in parallel:
# US1:
T010: Unit test for Priority enum
T011: Unit test for priority validation

# US3:
T022: Unit test for search function
T023: Unit test for case-insensitive matching
```

### Different User Stories

```bash
# After Foundational complete, these can run in parallel:
Phase 3 (US1) | Phase 4 (US2)  # P1 stories
Phase 5 (US3) | Phase 6 (US4) | Phase 7 (US5) | Phase 8 (US6)  # P2 stories
Phase 9 (US7)  # P3 story (after P2 filter stories if combining)
```

---

## Implementation Strategy

### MVP First (User Stories 1-2 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1 (Priority)
4. Complete Phase 4: User Story 2 (Tags)
5. **STOP and VALIDATE**: Users can create tasks with priorities and tags
6. Deploy/demo MVP

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. Add US1 + US2 → Priority + Tags work (MVP)
3. Add US3 → Search works
4. Add US4, US5, US6 → All filters work
5. Add US7 → Sorting works
6. Add US8 → Combined filters work
7. Polish → Production ready

---

## Task Summary

| Phase | User Story | Task Count | Parallel Tasks |
|-------|-----------|------------|----------------|
| 1 | Setup | 3 | 2 |
| 2 | Foundational | 6 | 2 |
| 3 | US1 - Priority | 6 | 2 |
| 4 | US2 - Tags | 6 | 2 |
| 5 | US3 - Search | 7 | 2 |
| 6 | US4 - Status Filter | 4 | 1 |
| 7 | US5 - Priority Filter | 5 | 2 |
| 8 | US6 - Tag Filter | 5 | 2 |
| 9 | US7 - Sort | 7 | 3 |
| 10 | US8 - Combined | 6 | 2 |
| 11 | Polish | 6 | 3 |
| **Total** | | **61** | **23** |

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story is independently completable and testable
- Commit after each task or logical group
- All code must include header: `# Generated from @specs/features/task-priorities-search-sorting/spec.md`
- Run `ruff check` and `ruff format` after each phase

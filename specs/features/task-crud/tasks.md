# Tasks: Task CRUD Operations

**Input**: Design documents from `/specs/features/task-crud/`
**Prerequisites**: plan.md ✅, spec.md ✅, data-model.md ✅, research.md ✅, quickstart.md ✅

**Tests**: Manual test checklist included (per Phase 1 requirements). Unit tests included for service layer validation.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1-US5)
- Include exact file paths in descriptions

## User Stories Mapping

| ID | User Story | Priority | Commands |
|----|-----------|----------|----------|
| US1 | Add a new task | P1 | `add` |
| US2 | View all tasks | P1 | `list` |
| US3 | Update a task | P2 | `update` |
| US4 | Delete a task | P2 | `delete` |
| US5 | Mark task complete | P2 | `complete` |

---

## Phase 1: Setup (Project Initialization)

**Purpose**: Create project skeleton with Click dependency

- [x] T001 Create project directory structure: `src/`, `src/commands/`, `src/models/`, `src/services/`, `src/storage/`, `tests/`, `tests/unit/`, `tests/manual/`
- [x] T002 Create `pyproject.toml` with Click dependency and `todo` entry point script
- [x] T003 [P] Create all `__init__.py` files for Python packages
- [x] T004 [P] Create `src/errors.py` with custom exception classes (TaskValidationError, TaskNotFoundError) and error codes ERR_TASK_001 to ERR_TASK_006
- [x] T005 Verify setup with `pip install -e .` and confirm `todo --help` shows stub

**Checkpoint**: Project structure ready, `pip install -e .` succeeds

---

## Phase 2: Foundational (Data Model & Storage)

**Purpose**: Core entities and storage that ALL user stories depend on

**⚠️ CRITICAL**: No user story commands can work until this phase is complete

- [x] T006 Create `Task` dataclass in `src/models/task.py` with fields: id (int), title (str), description (str|None), completed (bool), created_at (datetime)
- [x] T007 [P] Add `validate_title()` function in `src/models/task.py` - validates 1-200 chars, raises TaskValidationError
- [x] T008 [P] Add `validate_description()` function in `src/models/task.py` - validates max 1000 chars, raises TaskValidationError
- [x] T009 Create `TaskStore` class in `src/storage/task_store.py` with `_tasks: dict[int, Task]` and `_next_id: int`
- [x] T010 Implement `TaskStore.add()` in `src/storage/task_store.py` - assigns ID, stores task, increments counter
- [x] T011 [P] Implement `TaskStore.get_all()` in `src/storage/task_store.py` - returns list sorted by ID
- [x] T012 [P] Implement `TaskStore.get_by_id()` in `src/storage/task_store.py` - returns Task or None
- [x] T013 [P] Implement `TaskStore.update()` in `src/storage/task_store.py` - modifies task fields
- [x] T014 [P] Implement `TaskStore.delete()` in `src/storage/task_store.py` - removes task, returns bool
- [x] T015 [P] Implement `TaskStore.toggle_complete()` in `src/storage/task_store.py` - flips completed flag
- [x] T016 Create `TaskService` class in `src/services/task_service.py` wrapping TaskStore with validation
- [x] T017 Create CLI group in `src/main.py` with `@click.group()` and `--verbose` flag

**Checkpoint**: Foundation ready - `python -m src --help` works, TaskService can be instantiated

---

## Phase 3: User Story 1 - Add Task (Priority: P1) 🎯 MVP

**Goal**: User can add a new task with title and optional description

**Independent Test**: Run `todo add "Test task"` and `todo add "Task 2" --description "Details"` - both should print success message with task ID

### Implementation for User Story 1

- [x] T018 [US1] Implement `TaskService.create_task(title, description)` in `src/services/task_service.py` - validates input, calls store.add(), returns Task
- [x] T019 [US1] Create `add` command in `src/commands/add.py` with `@click.argument('title')` and `@click.option('--description')`
- [x] T020 [US1] Register `add` command in `src/main.py` via `cli.add_command()`
- [x] T021 [US1] Implement success output: `Task {id} created: {title}`
- [x] T022 [US1] Implement error handling for empty title → `Error: Title is required`
- [x] T023 [US1] Implement error handling for title > 200 chars → `Error: Title must be 200 characters or less`
- [x] T024 [US1] Implement error handling for description > 1000 chars → `Error: Description must be 1000 characters or less`

**Checkpoint**: `todo add "Buy groceries"` prints `Task 1 created: Buy groceries`

---

## Phase 4: User Story 2 - View Tasks (Priority: P1) 🎯 MVP

**Goal**: User can view all tasks in a formatted list

**Independent Test**: After adding tasks, run `todo list` - should show table with ID, Status, Title, Created columns

### Implementation for User Story 2

- [x] T025 [US2] Implement `TaskService.list_tasks()` in `src/services/task_service.py` - returns all tasks sorted by ID
- [x] T026 [US2] Create `list_tasks` command in `src/commands/list_cmd.py` (note: `list.py` conflicts with Python builtin)
- [x] T027 [US2] Implement table formatting helper function `format_task_table(tasks)` in `src/commands/list_cmd.py`
- [x] T028 [US2] Register `list` command in `src/main.py` via `cli.add_command()` with `name='list'`
- [x] T029 [US2] Implement empty list case: print `No tasks found.`
- [x] T030 [US2] Implement table output with header: `ID  Status  Title  Created` and status indicators `[x]`/`[ ]`

**Checkpoint**: `todo list` shows formatted table or "No tasks found."

---

## Phase 5: User Story 3 - Update Task (Priority: P2)

**Goal**: User can update an existing task's title and/or description

**Independent Test**: Run `todo update 1 --title "New title"` after adding a task - should print `Task 1 updated.`

### Implementation for User Story 3

- [x] T031 [US3] Implement `TaskService.update_task(task_id, title, description)` in `src/services/task_service.py` - validates, updates, handles not found
- [x] T032 [US3] Create `update` command in `src/commands/update.py` with `@click.argument('task_id', type=int)` and options `--title`, `--description`
- [x] T033 [US3] Register `update` command in `src/main.py`
- [x] T034 [US3] Implement success output: `Task {id} updated.`
- [x] T035 [US3] Implement error: task not found → `Error: Task not found: {id}`
- [x] T036 [US3] Implement error: invalid ID format (Click handles via type=int) → `Error: Invalid task ID`
- [x] T037 [US3] Implement error: no options → `Error: No updates provided. Use --title or --description.`
- [x] T038 [US3] Implement error: empty title → `Error: Title cannot be empty`

**Checkpoint**: `todo update 1 --title "Updated"` prints `Task 1 updated.`

---

## Phase 6: User Story 4 - Delete Task (Priority: P2)

**Goal**: User can delete a task by ID

**Independent Test**: Run `todo delete 1` after adding a task - should print `Task 1 deleted.`

### Implementation for User Story 4

- [x] T039 [US4] Implement `TaskService.delete_task(task_id)` in `src/services/task_service.py` - deletes task, raises if not found
- [x] T040 [US4] Create `delete` command in `src/commands/delete.py` with `@click.argument('task_id', type=int)`
- [x] T041 [US4] Register `delete` command in `src/main.py`
- [x] T042 [US4] Implement success output: `Task {id} deleted.`
- [x] T043 [US4] Implement error: task not found → `Error: Task not found: {id}`
- [x] T044 [US4] Implement error: invalid ID format → `Error: Invalid task ID`

**Checkpoint**: `todo delete 1` prints `Task 1 deleted.`

---

## Phase 7: User Story 5 - Mark Complete (Priority: P2)

**Goal**: User can toggle task completion status

**Independent Test**: Run `todo complete 1` twice - first prints "marked as complete", second prints "marked as pending"

### Implementation for User Story 5

- [x] T045 [US5] Implement `TaskService.toggle_complete(task_id)` in `src/services/task_service.py` - toggles completed flag, returns task
- [x] T046 [US5] Create `complete` command in `src/commands/complete.py` with `@click.argument('task_id', type=int)`
- [x] T047 [US5] Register `complete` command in `src/main.py`
- [x] T048 [US5] Implement success output based on new status: `Task {id} marked as complete.` or `Task {id} marked as pending.`
- [x] T049 [US5] Implement error: task not found → `Error: Task not found: {id}`
- [x] T050 [US5] Implement error: invalid ID format → `Error: Invalid task ID`

**Checkpoint**: `todo complete 1` toggles and prints appropriate message

---

## Phase 8: Testing & Polish

**Purpose**: Verification and quality assurance

- [x] T051 [P] Create manual test checklist in `tests/manual/phase1-checklist.md` covering all acceptance criteria from spec.md
- [x] T052 [P] Create `tests/unit/test_task_model.py` with tests for Task dataclass and validation functions
- [x] T053 [P] Create `tests/unit/test_task_store.py` with tests for TaskStore CRUD operations
- [x] T054 [P] Create `tests/unit/test_task_service.py` with tests for TaskService business logic
- [x] T055 Execute manual test checklist - verify all acceptance criteria pass
- [x] T056 Run `ruff check src/` and `ruff format --check src/` - fix any issues
- [x] T057 Verify all error messages match spec exactly (character-for-character comparison)
- [x] T058 Add header comment `# Generated from @specs/features/task-crud/spec.md` to all source files

**Checkpoint**: All tests pass, linting clean, spec compliance verified

---

## Dependencies & Execution Order

### Phase Dependencies

```text
Phase 1: Setup ──────────────────────┐
                                     │
                                     ▼
Phase 2: Foundational ───────────────┤ (BLOCKS all user stories)
                                     │
         ┌───────────┬───────────┬───┴───────┬───────────┐
         ▼           ▼           ▼           ▼           ▼
      Phase 3     Phase 4     Phase 5     Phase 6     Phase 7
       (US1)       (US2)       (US3)       (US4)       (US5)
         │           │           │           │           │
         └───────────┴───────────┴─────┬─────┴───────────┘
                                       ▼
                               Phase 8: Polish
```

### User Story Dependencies

| Story | Depends On | Can Parallel With |
|-------|------------|-------------------|
| US1 (Add) | Phase 2 | US2, US3, US4, US5 |
| US2 (List) | Phase 2, US1 (needs tasks to list) | US3, US4, US5 |
| US3 (Update) | Phase 2 | US4, US5 |
| US4 (Delete) | Phase 2 | US3, US5 |
| US5 (Complete) | Phase 2 | US3, US4 |

**Note**: For practical testing, US1 (Add) should be completed first so other commands have tasks to operate on.

### Within Each Phase

- Tasks marked [P] can run in parallel
- Tasks without [P] must run sequentially (file dependencies)

---

## Parallel Execution Examples

### Phase 2: Foundational (after T009)

```bash
# These can all run in parallel (different files):
T011: TaskStore.get_all()
T012: TaskStore.get_by_id()
T013: TaskStore.update()
T014: TaskStore.delete()
T015: TaskStore.toggle_complete()
```

### Phase 8: Testing (all parallel)

```bash
# These can all run in parallel (different test files):
T051: Manual checklist
T052: test_task_model.py
T053: test_task_store.py
T054: test_task_service.py
```

---

## Implementation Strategy

### MVP First (US1 + US2 Only)

1. ✅ Complete Phase 1: Setup
2. ✅ Complete Phase 2: Foundational
3. ✅ Complete Phase 3: User Story 1 (Add)
4. ✅ Complete Phase 4: User Story 2 (List)
5. ✅ **VALIDATED**: Can add and view tasks
6. ✅ Demo MVP: `todo add "Task"` → `todo list`

### Full Feature Delivery

1. ✅ Complete MVP (US1 + US2)
2. ✅ Add US3 (Update) → Tested
3. ✅ Add US4 (Delete) → Tested
4. ✅ Add US5 (Complete) → Tested
5. ✅ Polish phase - 48 unit tests pass, linting clean
6. Ready for commit: `feat(phase1): implement task-crud via /sp.implement from @specs/features/task-crud/spec.md`

---

## Summary

| Metric | Value |
|--------|-------|
| Total Tasks | 58 |
| Setup Tasks | 5 (T001-T005) |
| Foundational Tasks | 12 (T006-T017) |
| US1 Tasks | 7 (T018-T024) |
| US2 Tasks | 6 (T025-T030) |
| US3 Tasks | 8 (T031-T038) |
| US4 Tasks | 6 (T039-T044) |
| US5 Tasks | 6 (T045-T050) |
| Polish Tasks | 8 (T051-T058) |
| Parallelizable Tasks | 22 (marked with [P]) |
| MVP Scope | T001-T030 (US1 + US2) |

---

## Notes

- All tasks include exact file paths
- [P] tasks can run in parallel (different files, no dependencies)
- [US#] labels map tasks to user stories for traceability
- Constitution compliance: diff limits ≤200 lines per commit, ≤5 files touched
- Error messages must match spec exactly (character-for-character)
- All source files need header: `# Generated from @specs/features/task-crud/spec.md`

---

**Generated from**: @specs/features/task-crud/plan.md, @specs/features/task-crud/spec.md

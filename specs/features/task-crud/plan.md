# Implementation Plan: Task CRUD Operations

**Branch**: `001-task-crud` | **Date**: 2026-01-16 | **Spec**: [@specs/features/task-crud/spec.md](./spec.md)
**Input**: Feature specification from `/specs/features/task-crud/spec.md`

## Summary

Implement a Python console CLI application for basic task management using the Click framework. The app will support creating, reading, updating, deleting, and toggling completion status of tasks stored in-memory. All data is transient (lost on exit). This is Phase 1 of the Todo-app evolution.

## Technical Context

**Language/Version**: Python 3.13+
**Primary Dependencies**: Click (CLI framework)
**Storage**: In-memory (Python dict for O(1) lookups by ID)
**Testing**: Manual test script + pytest for unit tests
**Target Platform**: Linux/macOS/Windows console
**Project Type**: Single CLI application
**Performance Goals**: <500ms CLI response (per constitution IX)
**Constraints**: No persistence, single-user, single-threaded
**Scale/Scope**: Single user, unlimited in-memory tasks (bounded by RAM)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Spec-Driven Development | ✅ PASS | All code generated from `@specs/features/task-crud/spec.md` |
| II. Iterative Refinement | ✅ PASS | Acceptance criteria defined in spec (Given/When/Then implied) |
| III. Reusability & Modularity | ✅ PASS | Service layer separate from CLI; enables Phase 2 reuse |
| IV. Phase-wise Progression | ✅ PASS | Phase 1 only; no dependencies on future phases |
| V. Traceability | ✅ PASS | Commits will reference `@specs/features/task-crud/spec.md` |
| VI. Clean & Testable Code | ✅ PASS | Manual test script + unit tests; diff limits observed |
| VII. Security | ✅ PASS | Input validation (title ≤200, desc ≤1000, no control chars) |
| IX. Performance | ✅ PASS | <500ms target achievable with in-memory operations |
| X. Error Handling | ✅ PASS | Unique error codes, stderr for errors, `--verbose` flag |

**Gate Result**: PASS - No violations. Proceed to implementation phases.

## Architecture Sketch

```text
┌─────────────────────────────────────────────────────────────────┐
│                         CLI Layer (Click)                       │
│  main.py: Entry point with @click.group()                       │
│  commands.py: add, list, update, delete, complete subcommands   │
└────────────────────────────┬────────────────────────────────────┘
                             │ calls
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                       Task Service Layer                        │
│  services/task_service.py: Business logic (CRUD operations)     │
│  - create_task(title, description) → Task                       │
│  - get_all_tasks() → List[Task]                                 │
│  - update_task(id, title?, description?) → Task                 │
│  - delete_task(id) → bool                                       │
│  - toggle_complete(id) → Task                                   │
└────────────────────────────┬────────────────────────────────────┘
                             │ uses
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                      In-Memory Storage                          │
│  storage/task_store.py: Dict[int, Task] + ID counter            │
│  - _tasks: dict[int, Task]                                      │
│  - _next_id: int (starts at 1)                                  │
└─────────────────────────────────────────────────────────────────┘
                             │ stores
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                         Data Model                              │
│  models/task.py: Task dataclass                                 │
│  - id: int                                                      │
│  - title: str (1-200 chars)                                     │
│  - description: str | None (max 1000 chars)                     │
│  - completed: bool (default False)                              │
│  - created_at: datetime                                         │
└─────────────────────────────────────────────────────────────────┘
```

## Project Structure

### Documentation (this feature)

```text
specs/features/task-crud/
├── spec.md              # Feature specification (exists)
├── plan.md              # This file
├── research.md          # Click patterns research
├── data-model.md        # Task entity details
├── quickstart.md        # How to run and test
└── tasks.md             # Implementation tasks (created by /sp.tasks)
```

### Source Code (repository root)

```text
src/
├── __init__.py
├── main.py              # CLI entry point (@click.group)
├── commands/
│   ├── __init__.py
│   ├── add.py           # add command
│   ├── list.py          # list command
│   ├── update.py        # update command
│   ├── delete.py        # delete command
│   └── complete.py      # complete command
├── models/
│   ├── __init__.py
│   └── task.py          # Task dataclass
├── services/
│   ├── __init__.py
│   └── task_service.py  # Business logic
├── storage/
│   ├── __init__.py
│   └── task_store.py    # In-memory storage
└── errors.py            # Custom exceptions with error codes

tests/
├── __init__.py
├── manual/
│   └── phase1-checklist.md  # Manual test script
└── unit/
    ├── __init__.py
    ├── test_task_model.py
    ├── test_task_service.py
    └── test_commands.py
```

**Structure Decision**: Single project layout (Option 1). CLI application with clear separation between CLI layer (`commands/`), business logic (`services/`), and storage (`storage/`). This enables Phase 2 reuse where FastAPI can import `services/` directly.

## Key Decisions Needing Documentation

| # | Decision | Options Considered | Chosen | Rationale |
|---|----------|-------------------|--------|-----------|
| 1 | Storage data structure | List vs Dict | **Dict** | O(1) lookup by ID; list requires O(n) scan for get/update/delete |
| 2 | ID generation | UUID vs Auto-increment | **Auto-increment** | Spec mandates incrementing integer IDs starting from 1 |
| 3 | Task model | Plain dict vs Dataclass | **Dataclass** | Type safety, IDE support, clean interface; aligns with SQLModel migration in Phase 2 |
| 4 | Command organization | Single file vs Separate files | **Separate files** | Constitution III (modularity); easier testing; cleaner diffs |
| 5 | Error handling | Generic exceptions vs Custom | **Custom with error codes** | Constitution X requires `ERR_<MODULE>_<NUMBER>` format |

**📋 Architectural Decision Detected**: Storage data structure choice (Dict vs List) and Task model choice (Dataclass) affect Phase 2 migration. Document reasoning? Run `/sp.adr storage-and-model-decisions`

## Implementation Phases

### Phase 0: Setup & Research
**Goal**: Project skeleton and validated patterns

| Step | Task | Verification |
|------|------|--------------|
| 0.1 | Create project structure (directories, `__init__.py` files) | `ls -R src/` shows structure |
| 0.2 | Initialize `pyproject.toml` with Click dependency | `pip install -e .` succeeds |
| 0.3 | Validate Click patterns (group, command, option, argument) | Sample command runs |
| 0.4 | Document research findings in `research.md` | File exists with Click patterns |

### Phase 1: Data Model
**Goal**: Task entity ready for use

| Step | Task | Verification |
|------|------|--------------|
| 1.1 | Create `Task` dataclass with all fields | Import succeeds |
| 1.2 | Add validation method for title (1-200 chars) | Unit test passes |
| 1.3 | Add validation method for description (max 1000 chars) | Unit test passes |
| 1.4 | Document model in `data-model.md` | File exists |

### Phase 2: Storage Layer
**Goal**: In-memory CRUD operations

| Step | Task | Verification |
|------|------|--------------|
| 2.1 | Create `TaskStore` class with `_tasks` dict and `_next_id` | Import succeeds |
| 2.2 | Implement `add(task)` → assigns ID, stores task | Unit test passes |
| 2.3 | Implement `get_all()` → returns list sorted by ID | Unit test passes |
| 2.4 | Implement `get_by_id(id)` → returns Task or None | Unit test passes |
| 2.5 | Implement `update(id, updates)` → modifies task | Unit test passes |
| 2.6 | Implement `delete(id)` → removes task | Unit test passes |

### Phase 3: Service Layer
**Goal**: Business logic with validation

| Step | Task | Verification |
|------|------|--------------|
| 3.1 | Create `TaskService` class wrapping `TaskStore` | Import succeeds |
| 3.2 | Implement `create_task(title, desc)` with validation | Unit test passes |
| 3.3 | Implement `list_tasks()` | Unit test passes |
| 3.4 | Implement `update_task(id, title?, desc?)` | Unit test passes |
| 3.5 | Implement `delete_task(id)` with not-found handling | Unit test passes |
| 3.6 | Implement `toggle_complete(id)` | Unit test passes |
| 3.7 | Create custom exceptions in `errors.py` | Import succeeds |

### Phase 4: CLI Commands
**Goal**: All commands functional per spec

| Step | Task | Verification |
|------|------|--------------|
| 4.1 | Create CLI group in `main.py` | `python -m src --help` works |
| 4.2 | Implement `add` command | Manual test: create task |
| 4.3 | Implement `list` command with table formatting | Manual test: view tasks |
| 4.4 | Implement `update` command | Manual test: modify task |
| 4.5 | Implement `delete` command | Manual test: remove task |
| 4.6 | Implement `complete` command (toggle) | Manual test: toggle status |
| 4.7 | Add error handling for all commands | Error messages match spec |

### Phase 5: Testing & Polish
**Goal**: Verified against all acceptance criteria

| Step | Task | Verification |
|------|------|--------------|
| 5.1 | Create `tests/manual/phase1-checklist.md` | File exists with all scenarios |
| 5.2 | Execute manual test checklist | All boxes checked |
| 5.3 | Add unit tests for edge cases | `pytest` passes |
| 5.4 | Add `--verbose` flag for debug output | Flag works |
| 5.5 | Create `quickstart.md` with usage examples | File exists |
| 5.6 | Verify all error messages match spec exactly | Manual comparison |

## Testing Strategy

### Acceptance Criteria Mapping

| Spec Requirement | Test Type | Test Location |
|-----------------|-----------|---------------|
| Create: title required (1-200 chars) | Unit | `test_task_service.py::test_create_validation` |
| Create: description optional (max 1000) | Unit | `test_task_service.py::test_create_with_description` |
| Create: auto-increment ID from 1 | Unit | `test_task_store.py::test_id_generation` |
| Create: default completed=False | Unit | `test_task_model.py::test_default_completed` |
| Create: records created_at | Unit | `test_task_service.py::test_created_at` |
| List: shows ID, title, status, date | Manual | `phase1-checklist.md` |
| List: "No tasks found" when empty | Manual | `phase1-checklist.md` |
| Update: at least one field required | Unit | `test_task_service.py::test_update_no_fields` |
| Update: not found error | Unit | `test_task_service.py::test_update_not_found` |
| Delete: removes task | Unit | `test_task_store.py::test_delete` |
| Delete: not found error | Unit | `test_task_service.py::test_delete_not_found` |
| Complete: toggles status | Unit | `test_task_service.py::test_toggle_complete` |
| All: invalid ID format error | Unit | `test_commands.py::test_invalid_id` |

### Error Codes

| Code | Condition | Message |
|------|-----------|---------|
| `ERR_TASK_001` | Empty title | `Error: Title is required` |
| `ERR_TASK_002` | Title > 200 chars | `Error: Title must be 200 characters or less` |
| `ERR_TASK_003` | Description > 1000 chars | `Error: Description must be 1000 characters or less` |
| `ERR_TASK_004` | Task not found | `Error: Task not found: <id>` |
| `ERR_TASK_005` | Invalid ID format | `Error: Invalid task ID` |
| `ERR_TASK_006` | No update fields | `Error: No updates provided. Use --title or --description.` |

## Quality Validation

| Check | Tool | Command |
|-------|------|---------|
| Linting | ruff | `ruff check src/` |
| Formatting | ruff | `ruff format --check src/` |
| Type checking | (optional) mypy | `mypy src/` |
| Unit tests | pytest | `pytest tests/unit/` |
| Manual tests | checklist | Review `tests/manual/phase1-checklist.md` |

## Research Approach

**Concurrent validation during planning:**
1. ✅ Click documentation reviewed for command/option/argument patterns
2. ✅ Click group pattern for hierarchical commands confirmed
3. ✅ Error handling via `click.echo()` to stderr with `err=True`
4. ✅ Dataclass usage for Python 3.13+ confirmed (no attrs needed)

**References:**
- [Click Documentation](https://click.palletsprojects.com/)
- [Click GitHub](https://github.com/pallets/click)
- [Real Python Click Tutorial](https://realpython.com/python-click/)

## Complexity Tracking

> **No violations detected. Table not applicable.**

## Next Steps

1. Run `/sp.tasks` to generate `tasks.md` with granular implementation tasks
2. Run `/sp.implement` to execute tasks and generate code
3. Execute manual test checklist to verify all acceptance criteria
4. Commit with: `feat(phase1): implement task-crud via /sp.implement from @specs/features/task-crud/spec.md`

---

**Generated from**: @specs/features/task-crud/spec.md
**Constitution Version**: 1.1.0

# Implementation Plan: Task Recurring & Due Dates Reminders

**Branch**: `003-task-recurring-due-dates-reminders` | **Date**: 2026-01-17 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `@specs/features/task-recurring-Due-Dates-and-reminders/spec.md`

## Summary

Extend the Task model with recurring intervals (daily/weekly/monthly), due dates with time support, and reminder offsets. When a recurring task is completed, automatically create the next instance with the due date advanced by the interval. For Phase 1 (CLI), reminders are displayed via `list --reminders`; Phase 2+ adds browser notifications.

## Technical Context

**Language/Version**: Python 3.13+
**Primary Dependencies**: Click (CLI framework), datetime (stdlib for date handling)
**Storage**: In-memory (Phase 1); Neon PostgreSQL (Phase 2+)
**Testing**: pytest with manual test script for CLI verification
**Target Platform**: Linux/macOS/Windows terminal (CLI)
**Project Type**: Single project (CLI application extending task-crud)
**Performance Goals**: All operations < 500ms; reminder accuracy ±1 minute
**Constraints**: Fixed intervals only (daily/weekly/monthly); no external scheduling libraries; browser notifications only (no email/SMS)
**Scale/Scope**: Single user, up to 1000 tasks in memory; single timezone

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Spec-Driven Development | PASS | All code generated from spec via /sp.implement |
| II. Iterative Refinement | PASS | Spec has testable Given/When/Then scenarios |
| III. Reusability & Modularity | PASS | Recurring/reminder logic in src/services/, reusable across phases |
| IV. Phase-wise Progression | PASS | Extends Phase 1; compatible with Phase 2 (DB) and Phase 3 (chatbot) |
| V. Traceability | PASS | Commits will reference @specs/features/task-recurring-Due-Dates-and-reminders/spec.md |
| VI. Clean & Testable Code | PASS | <200 lines per commit target; pytest tests |
| VII. Security (Phase 1) | PASS | No secrets; input validation for dates/intervals |
| VIII. Documentation-First | PASS | Spec complete with user stories, edge cases |
| IX. Performance | PASS | 500ms budget for operations; 2s for recurring task creation |
| X. Error Handling | PASS | Error messages specified for invalid dates/intervals |

**Gate Result**: PASS - No violations. Proceed to Phase 0.

## Project Structure

### Documentation (this feature)

```text
specs/features/task-recurring-Due-Dates-and-reminders/
├── spec.md              # Feature specification (complete)
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (CLI contract)
│   └── cli-interface.md
└── tasks.md             # Phase 2 output (/sp.tasks command)
```

### Source Code (repository root)

```text
src/
├── models/
│   ├── task.py              # Extended Task model (add due_date, recurring_interval, reminder_offset)
│   └── recurring_interval.py # RecurringInterval enum
├── services/
│   ├── task_service.py      # Core task operations (extended)
│   ├── recurring_service.py # Auto-reschedule logic for recurring tasks
│   └── reminder_service.py  # Reminder calculation and tracking
├── cli/
│   └── commands.py          # Click commands (extended add, update, list, complete)
└── core/
    ├── validators.py        # Date and interval validation
    └── date_utils.py        # Date arithmetic (add day/week/month)

tests/
├── unit/
│   ├── test_recurring_service.py
│   ├── test_reminder_service.py
│   └── test_date_utils.py
├── integration/
│   └── test_cli_recurring.py
└── manual/
    └── phase1-checklist.md
```

**Structure Decision**: Single project structure. New services (recurring_service, reminder_service) encapsulate business logic, reusable for Phase 2 (Web) and Phase 3 (Chatbot).

## Complexity Tracking

> No constitution violations requiring justification.

*Table intentionally empty - all checks passed.*

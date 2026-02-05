---
id: "0004"
title: "Implement Task Recurring Due Dates Reminders"
stage: green
date: 2026-02-01
surface: agent
model: claude-opus-4-5
feature: task-recurring-Due-Dates-and-reminders
branch: 003-task-recurring-due-dates-reminders
user: maira
command: /sp.implement
labels: ["recurring", "due-dates", "reminders", "cli", "phase1"]
links:
  spec: specs/features/task-recurring-Due-Dates-and-reminders/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - src/models/recurring_interval.py
  - src/core/date_utils.py
  - src/core/validators.py
  - src/core/__init__.py
  - src/models/task.py
  - src/models/__init__.py
  - src/services/recurring_service.py
  - src/services/reminder_service.py
  - src/services/task_service.py
  - src/services/__init__.py
  - src/commands/add.py
  - src/commands/complete.py
  - src/commands/update.py
  - src/commands/list_cmd.py
  - src/storage/task_store.py
  - src/errors.py
  - tests/manual/phase1-recurring-checklist.md
tests:
  - tests/manual/phase1-recurring-checklist.md
---

## Prompt

do all tasks for @specs/features/task-recurring-Due-Dates-and-reminders/tasks.md

## Response snapshot

Implemented all 44 tasks for the Task Recurring & Due Dates Reminders feature:

**Phase 1 (Setup)**: Created RecurringInterval enum, date_utils module with add_interval function, and validators module with due date/reminder parsing.

**Phase 2 (Foundational)**: Extended Task model with due_date, recurring_interval, reminder_offset, and parent_task_id fields.

**Phase 3-5 (US1-US3)**: Added --recurring, --due, and --remind options to add command with full validation and output formatting.

**Phase 6 (US4)**: Implemented RecurringService for auto-rescheduling. Completing a recurring task creates the next occurrence with advanced due date.

**Phase 7 (US5)**: Extended update command with --recurring, --due, --remind options including "none" value to remove settings.

**Phase 8 (US6)**: Added --due filter (today/week/overdue) and --sort due to list command. Added overdue indicator (*) to output.

**Phase 9 (US7)**: Created ReminderService and added --reminders flag to list command showing upcoming reminders.

**Phase 10 (Polish)**: Updated module exports and created manual test checklist.

## Outcome

- ✅ Impact: All 7 user stories implemented (US1-US7), enabling recurring tasks, due dates, reminders, auto-reschedule, filtering, and sorting
- 🧪 Tests: Manual test checklist created at tests/manual/phase1-recurring-checklist.md
- 📁 Files: 17 files created/modified (7 new, 10 modified)
- 🔁 Next prompts: Run manual tests, create git commit
- 🧠 Reflection: Large feature successfully implemented in single session following tasks.md specification

## Evaluation notes (flywheel)

- Failure modes observed: None - all Python syntax validated
- Graders run and results (PASS/FAIL): py_compile PASS on all files
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): Add pytest unit tests

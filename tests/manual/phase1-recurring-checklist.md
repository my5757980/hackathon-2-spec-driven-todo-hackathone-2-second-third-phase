# Manual Test Checklist: Task Recurring & Due Dates Reminders

**Feature**: [spec.md](../../specs/features/task-recurring-Due-Dates-and-reminders/spec.md)
**Date**: 2026-01-18
**Tester**: _________________

## Prerequisites

- [ ] Python 3.13+ installed
- [ ] Virtual environment activated
- [ ] Dependencies installed (`pip install -e .`)

## US1: Create Recurring Tasks

### Test 1.1: Create task with daily recurrence
```bash
python -m src.main add "Daily standup" --recurring daily
```
- [ ] Task created successfully
- [ ] Output shows "Recurring: daily"

### Test 1.2: Create task with weekly recurrence and due date
```bash
python -m src.main add "Weekly meeting" --recurring weekly --due "2026-01-20 10:00"
```
- [ ] Task created successfully
- [ ] Output shows "Recurring: weekly"
- [ ] Output shows "Due: 2026-01-20 10:00"

### Test 1.3: Create task with monthly recurrence
```bash
python -m src.main add "Monthly review" --recurring monthly
```
- [ ] Task created successfully
- [ ] Output shows "Recurring: monthly"

### Test 1.4: Invalid recurrence value
```bash
python -m src.main add "Test" --recurring yearly
```
- [ ] Error shown: invalid choice

## US2: Set Due Dates

### Test 2.1: Create task with due date (date only)
```bash
python -m src.main add "Submit report" --due 2026-01-25
```
- [ ] Task created successfully
- [ ] Output shows "Due: 2026-01-25"

### Test 2.2: Create task with due date (date and time)
```bash
python -m src.main add "Meeting" --due "2026-01-25 14:30"
```
- [ ] Task created successfully
- [ ] Output shows "Due: 2026-01-25 14:30"

### Test 2.3: Invalid date format
```bash
python -m src.main add "Test" --due "25/01/2026"
```
- [ ] Error: "Invalid date. Use: YYYY-MM-DD or YYYY-MM-DD HH:MM"

### Test 2.4: Past date warning
```bash
python -m src.main add "Test" --due "2020-01-01"
```
- [ ] Warning: "Note: Due date is in the past"
- [ ] Task still created

## US3: Set Reminders

### Test 3.1: Create task with reminder
```bash
python -m src.main add "Important task" --due 2026-01-25 --remind 1h
```
- [ ] Task created successfully
- [ ] Output shows "Reminder: 1h before"

### Test 3.2: Reminder without due date
```bash
python -m src.main add "Test" --remind 1h
```
- [ ] Error: "Cannot set reminder without a due date"

### Test 3.3: All reminder offsets
```bash
python -m src.main add "Test 15m" --due 2026-01-25 --remind 15m
python -m src.main add "Test 30m" --due 2026-01-25 --remind 30m
python -m src.main add "Test 1h" --due 2026-01-25 --remind 1h
python -m src.main add "Test 2h" --due 2026-01-25 --remind 2h
python -m src.main add "Test 1d" --due 2026-01-25 --remind 1d
python -m src.main add "Test 1w" --due 2026-01-25 --remind 1w
```
- [ ] All tasks created with correct reminder offsets

## US4: Auto-Reschedule on Completion

### Test 4.1: Complete recurring task with due date
```bash
# First, create a recurring task
python -m src.main add "Weekly task" --recurring weekly --due "2026-01-20 10:00" --remind 1h
# Note the task ID (e.g., 1)
python -m src.main complete 1
```
- [ ] Original task marked complete
- [ ] Next occurrence created
- [ ] Due date advanced by 1 week (2026-01-27 10:00)
- [ ] Same reminder offset preserved

### Test 4.2: Complete recurring task without due date
```bash
python -m src.main add "Daily task" --recurring daily
python -m src.main complete <ID>
```
- [ ] Next occurrence created
- [ ] No due date on new task

### Test 4.3: Complete non-recurring task
```bash
python -m src.main add "One-time task"
python -m src.main complete <ID>
```
- [ ] Task marked complete
- [ ] No next occurrence created

## US5: Stop/Modify Recurrence

### Test 5.1: Stop recurrence
```bash
python -m src.main update <ID> --recurring none
```
- [ ] Output: "Task X recurrence stopped. This is now a one-time task."

### Test 5.2: Change recurrence interval
```bash
python -m src.main update <ID> --recurring monthly
```
- [ ] Output: "Task X recurrence changed to monthly."

### Test 5.3: Update due date
```bash
python -m src.main update <ID> --due 2026-01-30
```
- [ ] Output: "Task X updated: Due date set to 2026-01-30."

### Test 5.4: Remove due date
```bash
python -m src.main update <ID> --due none
```
- [ ] Output: "Task X updated: Due date removed."
- [ ] Reminder also removed

### Test 5.5: Update reminder
```bash
python -m src.main update <ID> --remind 2h
```
- [ ] Output: "Task X updated: Reminder set to 2h."

## US6: Filter/Sort by Due Date

### Test 6.1: List with due date filter (today)
```bash
# Create a task due today first
python -m src.main list --due today
```
- [ ] Only shows tasks due today

### Test 6.2: List with due date filter (week)
```bash
python -m src.main list --due week
```
- [ ] Shows tasks due within 7 days

### Test 6.3: List with due date filter (overdue)
```bash
python -m src.main list --due overdue
```
- [ ] Shows only overdue incomplete tasks

### Test 6.4: List sorted by due date
```bash
python -m src.main list --sort due
```
- [ ] Tasks sorted by due date
- [ ] Tasks without due date at end

### Test 6.5: Overdue indicator
```bash
python -m src.main list
```
- [ ] Overdue tasks show "*" indicator

## US7: View Upcoming Reminders

### Test 7.1: View reminders
```bash
# Create task with due date in next 24 hours + reminder
python -m src.main list --reminders
```
- [ ] Shows "Upcoming Reminders (next 24 hours):"
- [ ] Lists tasks with reminders due soon

## Regression Testing

### Test R1: Basic task CRUD still works
```bash
python -m src.main add "Basic task"
python -m src.main list
python -m src.main update <ID> --title "Updated task"
python -m src.main delete <ID>
```
- [ ] All basic operations work correctly

### Test R2: Help text updated
```bash
python -m src.main add --help
python -m src.main update --help
python -m src.main list --help
```
- [ ] Help shows new options (--recurring, --due, --remind, --reminders, --sort)

## Test Summary

| Section | Pass | Fail | Notes |
|---------|------|------|-------|
| US1: Recurring Tasks | | | |
| US2: Due Dates | | | |
| US3: Reminders | | | |
| US4: Auto-Reschedule | | | |
| US5: Stop/Modify | | | |
| US6: Filter/Sort | | | |
| US7: Reminders View | | | |
| Regression | | | |

**Overall Result**: ________

**Tester Signature**: _________________ **Date**: _________

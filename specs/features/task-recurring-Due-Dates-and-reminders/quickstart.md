# Quickstart: Task Recurring & Due Dates Reminders

**Feature**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md) | **Date**: 2026-01-18

## Overview

This feature extends the Todo CLI with:
- **Recurring tasks**: Daily, weekly, or monthly repetition with auto-rescheduling
- **Due dates**: Assign deadlines with date and optional time
- **Reminders**: Get notified before tasks are due

---

## Quick Examples

### Create a Recurring Task

```bash
# Daily standup every day
todo add "Daily standup" --recurring daily

# Weekly team meeting with due date and reminder
todo add "Weekly meeting" --recurring weekly --due "2026-01-20 10:00" --remind 1h

# Monthly report
todo add "Monthly report" --recurring monthly --due 2026-01-31
```

### Set Due Dates

```bash
# Task due on a specific date
todo add "Submit proposal" --due 2026-01-25

# Task due at specific time
todo add "Client call" --due "2026-01-20 14:30"

# Update existing task with due date
todo update 1 --due 2026-01-30
```

### Set Reminders

```bash
# Remind 1 day before
todo add "Prepare presentation" --due 2026-01-25 --remind 1d

# Remind 15 minutes before
todo add "Meeting prep" --due "2026-01-20 10:00" --remind 15m
```

Available reminder offsets: `15m`, `30m`, `1h`, `2h`, `1d`, `1w`

### Complete Recurring Tasks

```bash
# Completing a recurring task auto-creates the next occurrence
$ todo complete 1
Task 1 completed. Next occurrence (Task 5) created for 2026-01-27 10:00.
```

### View Tasks by Due Date

```bash
# Tasks due today
todo list --due today

# Tasks due this week
todo list --due week

# Overdue tasks
todo list --due overdue

# Sort by due date
todo list --sort due
```

### View Upcoming Reminders

```bash
# Show reminders for the next 24 hours
todo list --reminders
```

---

## Feature Combinations

### Recurring + Priority + Tags

```bash
todo add "Weekly standup" --recurring weekly --due "2026-01-20 09:00" --priority high --tag team
```

### Filter + Sort

```bash
# High priority tasks due this week, sorted by due date
todo list --due week --priority high --sort due
```

---

## Common Workflows

### 1. Setting Up a Weekly Meeting

```bash
# Create the recurring meeting
$ todo add "Team sync" --recurring weekly --due "2026-01-20 10:00" --remind 1h
Task 1 created: Team sync (Recurring: weekly, Due: 2026-01-20 10:00, Reminder: 1h before)

# After the meeting, mark complete
$ todo complete 1
Task 1 completed. Next occurrence (Task 2) created for 2026-01-27 10:00.
```

### 2. Managing a One-Time Deadline

```bash
# Create task with deadline
$ todo add "Submit quarterly report" --due 2026-01-31 --priority high --remind 1d
Task 3 created: Submit quarterly report (Priority: high, Due: 2026-01-31, Reminder: 1d before)

# Check what's due today
$ todo list --due today
```

### 3. Stopping a Recurring Task

```bash
# Remove recurrence (task becomes one-time)
$ todo update 2 --recurring none
Task 2 recurrence stopped. This is now a one-time task.
```

### 4. Changing Due Date

```bash
# Postpone task
$ todo update 3 --due 2026-02-05
Task 3 updated: Due date set to 2026-02-05.

# Remove due date entirely
$ todo update 3 --due none
Task 3 updated: Due date removed.
```

---

## Date Format Reference

| Format | Example | Description |
|--------|---------|-------------|
| `YYYY-MM-DD` | `2026-01-20` | Date only (time defaults to 00:00) |
| `YYYY-MM-DD HH:MM` | `2026-01-20 14:30` | Date with time |

---

## Reminder Offset Reference

| Offset | Description |
|--------|-------------|
| `15m` | 15 minutes before |
| `30m` | 30 minutes before |
| `1h` | 1 hour before (default) |
| `2h` | 2 hours before |
| `1d` | 1 day before |
| `1w` | 1 week before |

---

## Edge Cases

| Scenario | Behavior |
|----------|----------|
| Recurring task with no due date | Next occurrence created immediately on completion |
| Monthly task on Jan 31 | Next occurrence is Feb 28 (last day of month) |
| Reminder without due date | Error: "Cannot set reminder without a due date" |
| Past due date | Warning shown, task still created |
| Complete non-recurring task | Task marked complete, no new task created |

---

## Next Steps

After implementing this feature via `/sp.implement`:

1. Run `todo --help` to see the new options
2. Create a recurring task and verify it reschedules on completion
3. Test the `--due` filters and `--reminders` view
4. Check that existing task-crud and priorities features still work

---

## Related Documentation

- [Feature Specification](./spec.md)
- [Implementation Plan](./plan.md)
- [Research Decisions](./research.md)
- [Data Model](./data-model.md)
- [CLI Interface Contract](./contracts/cli-interface.md)

# CLI Interface Contract: Task Recurring & Due Dates Reminders

**Feature**: [spec.md](../spec.md) | **Plan**: [plan.md](../plan.md) | **Date**: 2026-01-18

## Command Extensions

This document defines the CLI contract for the recurring tasks, due dates, and reminders feature. All commands extend the existing task-crud CLI interface.

---

## `todo add` Command

### Extended Signature

```
todo add <title> [OPTIONS]
```

### New Options

| Option | Type | Required | Default | Description |
|--------|------|----------|---------|-------------|
| `--due` | STRING | No | None | Due date in YYYY-MM-DD or "YYYY-MM-DD HH:MM" format |
| `--recurring` | CHOICE | No | None | Recurrence interval: `daily`, `weekly`, `monthly` |
| `--remind` | CHOICE | No | "1h" | Reminder offset: `15m`, `30m`, `1h`, `2h`, `1d`, `1w` |

### Input Validation

| Input | Validation | Error Code | Error Message |
|-------|------------|------------|---------------|
| `--due` | Valid date format | ERR_TASK_010 | "Invalid date. Use: YYYY-MM-DD or YYYY-MM-DD HH:MM" |
| `--due` | Past date | WARN_TASK_001 | "Note: Due date is in the past" (warning, not error) |
| `--recurring` | Valid interval | ERR_TASK_011 | "Invalid recurrence. Use: daily, weekly, or monthly" |
| `--remind` | Valid offset | ERR_TASK_012 | "Invalid reminder. Use: 15m, 30m, 1h, 2h, 1d, or 1w" |
| `--remind` | Requires `--due` | ERR_TASK_013 | "Cannot set reminder without a due date" |

### Output Format

**Success (with all options)**:
```
Task <id> created: <title> (Recurring: <interval>, Due: <date>, Reminder: <offset> before)
```

**Success (with due date only)**:
```
Task <id> created: <title> (Due: <date>)
```

**Success (with recurring only)**:
```
Task <id> created: <title> (Recurring: <interval>)
```

### Examples

```bash
# Create recurring task with due date and reminder
$ todo add "Weekly team meeting" --recurring weekly --due "2026-01-20 10:00" --remind 1h
Task 1 created: Weekly team meeting (Recurring: weekly, Due: 2026-01-20 10:00, Reminder: 1h before)

# Create task with due date only
$ todo add "Submit report" --due 2026-01-25 --priority high
Task 2 created: Submit report (Priority: high, Due: 2026-01-25)

# Create recurring task without due date
$ todo add "Daily standup" --recurring daily
Task 3 created: Daily standup (Recurring: daily)
```

---

## `todo update` Command

### Extended Signature

```
todo update <id> [OPTIONS]
```

### New Options

| Option | Type | Required | Default | Description |
|--------|------|----------|---------|-------------|
| `--due` | STRING | No | - | Update due date; use "none" to remove |
| `--recurring` | CHOICE | No | - | Update recurrence; use "none" to stop |
| `--remind` | CHOICE | No | - | Update reminder offset; use "none" to remove |

### Input Validation

Same as `todo add` plus:

| Input | Validation | Error Code | Error Message |
|-------|------------|------------|---------------|
| `--remind none` | Auto-removes | - | Silently removed when `--due none` |
| `--recurring none` | Valid | - | Stops recurrence |

### Output Format

**Update due date**:
```
Task <id> updated: Due date set to <date>
```

**Update recurring**:
```
Task <id> recurrence changed to <interval>.
```

**Stop recurring**:
```
Task <id> recurrence stopped. This is now a one-time task.
```

**Remove due date**:
```
Task <id> updated: Due date removed.
```

### Examples

```bash
# Change recurrence
$ todo update 1 --recurring monthly
Task 1 recurrence changed to monthly.

# Stop recurrence
$ todo update 1 --recurring none
Task 1 recurrence stopped. This is now a one-time task.

# Update due date
$ todo update 2 --due 2026-01-30
Task 2 updated: Due date set to 2026-01-30.

# Remove due date (also removes reminder)
$ todo update 2 --due none
Task 2 updated: Due date removed.
```

---

## `todo complete` Command

### Extended Behavior for Recurring Tasks

When completing a recurring task:

1. Mark current task as completed
2. Create next occurrence with:
   - Same title, description, priority, tags
   - Due date advanced by interval (if set)
   - Same recurring interval and reminder offset
   - `parent_task_id` pointing to original task
   - New unique ID
   - `completed = False`

### Output Format

**Non-recurring task**:
```
Task <id> completed.
```

**Recurring task**:
```
Task <id> completed. Next occurrence (Task <new_id>) created for <next_due_date>.
```

**Recurring task without due date**:
```
Task <id> completed. Next occurrence (Task <new_id>) created.
```

### Examples

```bash
# Complete recurring task with due date
$ todo complete 1
Task 1 completed. Next occurrence (Task 4) created for 2026-01-27 10:00.

# Complete recurring task without due date
$ todo complete 3
Task 3 completed. Next occurrence (Task 5) created.

# Complete non-recurring task
$ todo complete 2
Task 2 completed.
```

---

## `todo list` Command

### Extended Signature

```
todo list [OPTIONS]
```

### New Options

| Option | Type | Required | Default | Description |
|--------|------|----------|---------|-------------|
| `--due` | CHOICE | No | - | Filter: `today`, `week`, `overdue` |
| `--sort` | CHOICE | No | - | Sort by: `due` (adds to existing options) |
| `--reminders` | FLAG | No | False | Show upcoming reminders |

### Output Format

**Standard list with due date and recurring columns**:
```
ID  Status  Priority  Title             Due           Recurring
--  ------  --------  -----             ---           ---------
1   [ ]     high      Weekly meeting    2026-01-20    weekly
2   [ ]     medium    Submit report     2026-01-25    -
3   [x]     medium    Old task          2026-01-15    -
```

**Overdue indicator**:
```
ID  Status  Priority  Title             Due           Recurring
--  ------  --------  -----             ---           ---------
1   [ ]     high      Old task          2026-01-10 *  -
                                        (overdue)
```

**Reminders view** (`--reminders`):
```
Upcoming Reminders (next 24 hours):
-----------------------------------
Task 1: Weekly meeting - Reminder at 2026-01-20 09:00 (1h before due)
Task 2: Submit report  - Reminder at 2026-01-24 00:00 (1d before due)
```

### Filter Behavior

| Filter | Description |
|--------|-------------|
| `--due today` | Tasks with due_date between 00:00 and 23:59 today |
| `--due week` | Tasks with due_date within next 7 days (including today) |
| `--due overdue` | Tasks with due_date < now AND completed = False |

### Sort Behavior

| Sort | Description |
|------|-------------|
| `--sort due` | Ascending by due_date; NULL due_dates at end |

### Examples

```bash
# View today's tasks
$ todo list --due today
ID  Status  Priority  Title           Due           Recurring
--  ------  --------  -----           ---           ---------
3   [ ]     high      Submit report   2026-01-17    -
5   [ ]     medium    Call client     2026-01-17    -

# View overdue tasks
$ todo list --due overdue
ID  Status  Priority  Title           Due           Recurring
--  ------  --------  -----           ---           ---------
1   [ ]     high      Old task        2026-01-10 *  -

# Sort by due date
$ todo list --sort due
ID  Status  Priority  Title             Due           Recurring
--  ------  --------  -----             ---           ---------
1   [ ]     high      Old task          2026-01-10    -
3   [ ]     high      Submit report     2026-01-17    -
5   [ ]     medium    Call client       2026-01-17    -
2   [ ]     low       No deadline       -             -

# View upcoming reminders
$ todo list --reminders
Upcoming Reminders (next 24 hours):
-----------------------------------
Task 3: Submit report - Reminder at 2026-01-16 23:00 (1h before due)
```

---

## Exit Codes

| Code | Description |
|------|-------------|
| 0 | Success |
| 1 | Invalid input / validation error |
| 2 | Task not found |

---

## Integration Points

### With task-crud

- Extends `Task` model with new fields
- Uses existing `TaskService` for CRUD operations
- Extends existing Click commands

### With task-priorities-search-sorting

- Compatible with existing `--priority` and `--tag` options
- Can combine filters: `todo list --due today --priority high`
- Can combine sorts: `todo list --sort due --sort priority`

---

## Performance Requirements

| Operation | Max Latency |
|-----------|-------------|
| Add task with recurring/due | < 500ms |
| Complete recurring task (creates next) | < 2s |
| List with due filter | < 500ms |
| List with reminders | < 500ms |

# Data Model: Task Recurring & Due Dates Reminders

**Feature**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md) | **Date**: 2026-01-17

## Entity Definitions

### RecurringInterval (Enum)

A string enumeration representing valid recurrence patterns.

```python
class RecurringInterval(StrEnum):
    NONE = "none"       # One-time task (default)
    DAILY = "daily"     # Repeats every day
    WEEKLY = "weekly"   # Repeats every 7 days
    MONTHLY = "monthly" # Repeats every month (same day)
```

**File**: `src/models/recurring_interval.py`

---

### Task Entity (Extended)

The Task model is extended with four new fields for recurring and reminder functionality.

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| id | int | Yes | Auto-increment | Unique identifier |
| title | str | Yes | - | Task title (1-200 chars) |
| description | str | No | None | Task details (max 2000 chars) |
| completed | bool | Yes | False | Completion status |
| created_at | datetime | Yes | datetime.now() | Creation timestamp |
| priority | Priority | Yes | MEDIUM | Importance level (HIGH/MEDIUM/LOW) |
| tags | list[str] | Yes | [] | Categorization labels |
| **due_date** | datetime | No | None | When task is due |
| **recurring_interval** | RecurringInterval | No | None | Recurrence pattern |
| **reminder_offset** | str | No | "1h" | How far before due to remind |
| **parent_task_id** | int | No | None | ID of original recurring task |

**File**: `src/models/task.py`

---

## Field Specifications

### due_date

- **Type**: `datetime | None`
- **Format**: ISO 8601 (stored as Python datetime)
- **Input formats**: `YYYY-MM-DD` or `YYYY-MM-DD HH:MM`
- **Validation**:
  - Must be valid date/time
  - Past dates allowed (with warning)
  - Time defaults to 00:00:00 if not specified

### recurring_interval

- **Type**: `RecurringInterval | None`
- **Valid values**: `none`, `daily`, `weekly`, `monthly`
- **Validation**:
  - Case-insensitive input (`WEEKLY` → `weekly`)
  - `None` and `"none"` both indicate one-time task

### reminder_offset

- **Type**: `str | None`
- **Valid values**: `15m`, `30m`, `1h`, `2h`, `1d`, `1w`
- **Default**: `"1h"` (when due_date is set)
- **Validation**:
  - Cannot set reminder without due_date
  - Cannot set reminder after due_date (offset > time until due)

### parent_task_id

- **Type**: `int | None`
- **Validation**:
  - Must reference valid task ID (if set)
  - Set automatically when recurring task creates next instance
  - Original recurring task has `parent_task_id = None`

---

## Relationships

```
┌─────────────────────────────────────────────────────────────┐
│                         Task                                │
├─────────────────────────────────────────────────────────────┤
│ id: 1                                                       │
│ title: "Weekly meeting"                                     │
│ recurring_interval: WEEKLY                                  │
│ due_date: 2026-01-20 10:00                                  │
│ parent_task_id: None  ◄── Original recurring task           │
│ completed: True                                             │
└─────────────────────────────────────────────────────────────┘
           │
           │ on complete: create next occurrence
           ▼
┌─────────────────────────────────────────────────────────────┐
│                         Task                                │
├─────────────────────────────────────────────────────────────┤
│ id: 2                                                       │
│ title: "Weekly meeting"                                     │
│ recurring_interval: WEEKLY                                  │
│ due_date: 2026-01-27 10:00  ◄── Advanced by 1 week          │
│ parent_task_id: 1           ◄── Points to original          │
│ completed: False                                            │
└─────────────────────────────────────────────────────────────┘
           │
           │ on complete: create next occurrence
           ▼
┌─────────────────────────────────────────────────────────────┐
│                         Task                                │
├─────────────────────────────────────────────────────────────┤
│ id: 3                                                       │
│ title: "Weekly meeting"                                     │
│ recurring_interval: WEEKLY                                  │
│ due_date: 2026-02-03 10:00                                  │
│ parent_task_id: 1           ◄── Still points to original    │
│ completed: False                                            │
└─────────────────────────────────────────────────────────────┘
```

---

## Validation Rules

### Create Task with Recurring/Due Date

| Rule | Validation | Error Message |
|------|------------|---------------|
| V-DUE-01 | due_date format valid | "Invalid date. Use: YYYY-MM-DD or YYYY-MM-DD HH:MM" |
| V-DUE-02 | due_date in past | Warning: "Note: Due date is in the past" |
| V-REC-01 | recurring_interval valid | "Invalid recurrence. Use: daily, weekly, or monthly" |
| V-REM-01 | reminder requires due_date | "Cannot set reminder without a due date" |
| V-REM-02 | reminder_offset valid | "Invalid reminder. Use: 15m, 30m, 1h, 2h, 1d, or 1w" |
| V-REM-03 | reminder before due_date | "Reminder cannot be after due date" |

### Update Task

| Rule | Validation | Error Message |
|------|------------|---------------|
| V-UPD-01 | Remove recurring | Sets recurring_interval to NONE |
| V-UPD-02 | Remove due_date with reminder | Also removes reminder_offset |
| V-UPD-03 | Change recurring after completion | Affects next occurrence only |

### Complete Recurring Task

| Rule | Behavior |
|------|----------|
| C-REC-01 | Create new task with next due_date |
| C-REC-02 | Copy title, description, priority, tags |
| C-REC-03 | Set parent_task_id to original task ID |
| C-REC-04 | Set completed = False on new task |
| C-REC-05 | Keep original task in history (completed = True) |

---

## Type Definitions

```python
# src/models/task.py
from dataclasses import dataclass, field
from datetime import datetime
from typing import Optional

from .priority import Priority
from .recurring_interval import RecurringInterval

@dataclass
class Task:
    id: int
    title: str
    completed: bool = False
    description: Optional[str] = None
    created_at: datetime = field(default_factory=datetime.now)
    priority: Priority = Priority.MEDIUM
    tags: list[str] = field(default_factory=list)
    # New fields for recurring/due dates
    due_date: Optional[datetime] = None
    recurring_interval: Optional[RecurringInterval] = None
    reminder_offset: Optional[str] = "1h"
    parent_task_id: Optional[int] = None
```

---

## Storage Considerations

### Phase 1 (In-Memory)

- Tasks stored in `list[Task]`
- No persistence between sessions
- Completed recurring tasks remain in list for history

### Phase 2+ (Database)

```sql
-- Migration for existing tasks table
ALTER TABLE tasks
ADD COLUMN due_date TIMESTAMP NULL,
ADD COLUMN recurring_interval VARCHAR(10) NULL CHECK (recurring_interval IN ('none', 'daily', 'weekly', 'monthly')),
ADD COLUMN reminder_offset VARCHAR(5) NULL DEFAULT '1h',
ADD COLUMN parent_task_id INTEGER NULL REFERENCES tasks(id);

CREATE INDEX idx_tasks_due_date ON tasks(due_date);
CREATE INDEX idx_tasks_parent ON tasks(parent_task_id);
```

---

## Example Data

```python
# One-time task with due date
task1 = Task(
    id=1,
    title="Submit report",
    priority=Priority.HIGH,
    due_date=datetime(2026, 1, 25),
    reminder_offset="1d",
)

# Recurring task (original)
task2 = Task(
    id=2,
    title="Weekly meeting",
    recurring_interval=RecurringInterval.WEEKLY,
    due_date=datetime(2026, 1, 20, 10, 0),
    reminder_offset="1h",
)

# Recurring task (generated instance)
task3 = Task(
    id=3,
    title="Weekly meeting",
    recurring_interval=RecurringInterval.WEEKLY,
    due_date=datetime(2026, 1, 27, 10, 0),
    reminder_offset="1h",
    parent_task_id=2,
)
```

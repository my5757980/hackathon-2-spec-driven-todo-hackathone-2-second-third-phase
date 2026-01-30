# Research: Task Recurring & Due Dates Reminders

**Feature**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md) | **Date**: 2026-01-17

## Phase 0 Research Decisions

### Decision 1: Date Arithmetic for Recurring Tasks

**Question**: How should we advance due dates when recurring tasks are completed?

**Options Considered**:
1. **Use `datetime.timedelta`** for day/week calculations + `calendar` for month
2. **Use `dateutil.relativedelta`** (external library)
3. **Manual calculation** with day/month overflow handling

**Decision**: Option 1 - stdlib `timedelta` + `calendar`

**Rationale**:
- No external dependencies (constraint from spec: "no external scheduling libraries")
- `timedelta(days=1)` for daily, `timedelta(weeks=1)` for weekly
- For monthly: use `calendar.monthrange()` to handle end-of-month edge cases
- Example: Jan 31 + 1 month → Feb 28 (last day of Feb)

**Implementation**:
```python
# src/core/date_utils.py
from datetime import datetime, timedelta
import calendar

def add_interval(dt: datetime, interval: str) -> datetime:
    if interval == "daily":
        return dt + timedelta(days=1)
    elif interval == "weekly":
        return dt + timedelta(weeks=1)
    elif interval == "monthly":
        # Advance month, handle day overflow
        year = dt.year + (dt.month // 12)
        month = (dt.month % 12) + 1
        last_day = calendar.monthrange(year, month)[1]
        day = min(dt.day, last_day)
        return dt.replace(year=year, month=month, day=day)
```

---

### Decision 2: RecurringInterval Enum Design

**Question**: How should we represent recurring intervals?

**Options Considered**:
1. **String literal** ("daily", "weekly", "monthly", "none")
2. **IntEnum** with implicit ordering
3. **StrEnum** (Python 3.11+) with string values

**Decision**: Option 3 - StrEnum

**Rationale**:
- Python 3.13+ supports StrEnum natively
- Direct string comparison for CLI input validation
- Serializes cleanly to JSON/storage
- Consistent with Priority enum pattern from task-priorities-search-sorting

**Implementation**:
```python
# src/models/recurring_interval.py
from enum import StrEnum

class RecurringInterval(StrEnum):
    NONE = "none"
    DAILY = "daily"
    WEEKLY = "weekly"
    MONTHLY = "monthly"
```

---

### Decision 3: Reminder Offset Parsing

**Question**: How should we parse and validate reminder offset strings like "15m", "1h", "1d"?

**Options Considered**:
1. **Regex parsing** with manual conversion
2. **Predefined mapping** (limited set)
3. **Parse library** like `pytimeparse`

**Decision**: Option 2 - Predefined mapping

**Rationale**:
- Spec explicitly limits offsets: "15m, 30m, 1h, 2h, 1d, 1w"
- No need for flexible parsing
- Simple dict lookup is faster and more maintainable
- Clear error messages for invalid input

**Implementation**:
```python
# src/core/validators.py
from datetime import timedelta

REMINDER_OFFSETS = {
    "15m": timedelta(minutes=15),
    "30m": timedelta(minutes=30),
    "1h": timedelta(hours=1),
    "2h": timedelta(hours=2),
    "1d": timedelta(days=1),
    "1w": timedelta(weeks=1),
}

def parse_reminder_offset(offset: str) -> timedelta:
    if offset not in REMINDER_OFFSETS:
        valid = ", ".join(REMINDER_OFFSETS.keys())
        raise ValueError(f"Invalid reminder. Use: {valid}")
    return REMINDER_OFFSETS[offset]
```

---

### Decision 4: Due Date Parsing

**Question**: How should we parse due date input from CLI?

**Options Considered**:
1. **`datetime.strptime()`** with multiple format attempts
2. **`dateutil.parser.parse()`** (external library)
3. **Click's `DateTime` type** (built-in)

**Decision**: Option 3 - Click's DateTime type with fallback

**Rationale**:
- Click already provides `DateTime` parameter type
- Supports ISO format (YYYY-MM-DD) natively
- For time component, parse with custom format
- No external dependencies

**Implementation**:
```python
# src/cli/commands.py
import click
from datetime import datetime

def parse_due_date(value: str) -> datetime:
    formats = [
        "%Y-%m-%d %H:%M",  # 2026-01-20 14:30
        "%Y-%m-%d",        # 2026-01-20 (midnight)
    ]
    for fmt in formats:
        try:
            return datetime.strptime(value, fmt)
        except ValueError:
            continue
    raise click.BadParameter("Invalid date. Use: YYYY-MM-DD or YYYY-MM-DD HH:MM")
```

---

### Decision 5: Reminder Storage and Tracking

**Question**: How should we track which reminders have been shown (Phase 1)?

**Options Considered**:
1. **Separate reminder list** with fired/pending status
2. **Field on Task** (`reminder_shown: bool`)
3. **Compute dynamically** on each `list --reminders` call

**Decision**: Option 3 - Compute dynamically

**Rationale**:
- Phase 1 is in-memory only, no persistent state
- Reminders are displayed via `list --reminders`, not pushed
- Computing "upcoming" reminders is simple: `now < due_date - offset`
- Avoids additional state management complexity

**Implementation**:
```python
# src/services/reminder_service.py
from datetime import datetime, timedelta

def get_upcoming_reminders(tasks: list, now: datetime = None) -> list:
    now = now or datetime.now()
    upcoming = []
    for task in tasks:
        if task.due_date and not task.completed:
            offset = parse_reminder_offset(task.reminder_offset or "1h")
            reminder_time = task.due_date - offset
            if now <= reminder_time <= now + timedelta(hours=24):
                upcoming.append((task, reminder_time))
    return sorted(upcoming, key=lambda x: x[1])
```

---

### Decision 6: Parent Task ID Tracking

**Question**: Should we track the chain of recurring task instances?

**Options Considered**:
1. **`parent_task_id`** pointing to original task
2. **`recurrence_chain_id`** shared among all instances
3. **No tracking** - each instance is independent

**Decision**: Option 1 - `parent_task_id`

**Rationale**:
- Spec includes `parent_task_id` in data model
- Allows tracing lineage for audit purposes
- Simpler than chain ID (no additional field needed)
- Original task = task where `parent_task_id is None` and `recurring_interval is not None`

**Implementation**:
```python
# In recurring_service.py
def create_next_occurrence(completed_task: Task, new_id: int) -> Task:
    parent_id = completed_task.parent_task_id or completed_task.id
    new_due = add_interval(completed_task.due_date, completed_task.recurring_interval)
    return Task(
        id=new_id,
        title=completed_task.title,
        description=completed_task.description,
        priority=completed_task.priority,
        tags=completed_task.tags.copy(),
        due_date=new_due,
        recurring_interval=completed_task.recurring_interval,
        reminder_offset=completed_task.reminder_offset,
        parent_task_id=parent_id,
        completed=False,
    )
```

---

## Summary

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Date arithmetic | stdlib timedelta + calendar | No external deps, handles edge cases |
| RecurringInterval | StrEnum | Native Python 3.13+, clean serialization |
| Reminder offset | Predefined mapping | Limited set per spec, simple validation |
| Due date parsing | Click DateTime + strptime | Built-in, no deps, supports both formats |
| Reminder tracking | Compute dynamically | Phase 1 in-memory, stateless approach |
| Parent task ID | Single field | Spec requirement, simpler than chain ID |

## Dependencies

- Python stdlib: `datetime`, `calendar`, `enum`
- Click: `DateTime` type, `BadParameter` exception
- No external libraries required

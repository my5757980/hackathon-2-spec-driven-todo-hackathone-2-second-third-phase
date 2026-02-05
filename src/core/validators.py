# Generated from @specs/features/task-recurring-Due-Dates-and-reminders/spec.md
"""Validators for recurring tasks, due dates, and reminders.

Provides parsing and validation for:
- Due dates (YYYY-MM-DD or YYYY-MM-DD HH:MM)
- Recurring intervals (daily, weekly, monthly, none)
- Reminder offsets (15m, 30m, 1h, 2h, 1d, 1w)
"""

from datetime import datetime, timedelta

from src.errors import TaskValidationError
from src.models.recurring_interval import RecurringInterval

# Error codes for validation
ERR_TASK_010 = "ERR_TASK_010"  # Invalid date format
ERR_TASK_011 = "ERR_TASK_011"  # Invalid recurrence interval
ERR_TASK_012 = "ERR_TASK_012"  # Invalid reminder offset
ERR_TASK_013 = "ERR_TASK_013"  # Reminder without due date

# Valid reminder offsets
VALID_REMINDER_OFFSETS = ("15m", "30m", "1h", "2h", "1d", "1w")


def parse_due_date(date_str: str) -> datetime:
    """Parse a due date string into a datetime.

    Args:
        date_str: Date in YYYY-MM-DD or "YYYY-MM-DD HH:MM" format

    Returns:
        Parsed datetime object

    Raises:
        TaskValidationError: If date format is invalid
    """
    formats = [
        "%Y-%m-%d %H:%M",  # With time
        "%Y-%m-%d",  # Date only (defaults to 00:00)
    ]

    for fmt in formats:
        try:
            return datetime.strptime(date_str, fmt)
        except ValueError:
            continue

    raise TaskValidationError(
        "Invalid date. Use: YYYY-MM-DD or YYYY-MM-DD HH:MM",
        ERR_TASK_010,
    )


def parse_recurring_interval(interval_str: str) -> RecurringInterval:
    """Parse a recurring interval string.

    Args:
        interval_str: Interval string (daily, weekly, monthly, none)

    Returns:
        RecurringInterval enum value

    Raises:
        TaskValidationError: If interval is invalid
    """
    interval_lower = interval_str.lower().strip()

    try:
        return RecurringInterval(interval_lower)
    except ValueError:
        raise TaskValidationError(
            "Invalid recurrence. Use: daily, weekly, or monthly",
            ERR_TASK_011,
        )


def validate_reminder_offset(offset: str) -> str:
    """Validate a reminder offset string.

    Args:
        offset: Reminder offset (15m, 30m, 1h, 2h, 1d, 1w)

    Returns:
        Validated offset string

    Raises:
        TaskValidationError: If offset is invalid
    """
    offset_lower = offset.lower().strip()

    if offset_lower not in VALID_REMINDER_OFFSETS:
        raise TaskValidationError(
            "Invalid reminder. Use: 15m, 30m, 1h, 2h, 1d, or 1w",
            ERR_TASK_012,
        )

    return offset_lower


def validate_reminder_with_due_date(
    reminder_offset: str | None, due_date: datetime | None
) -> None:
    """Validate that reminder is only set with a due date.

    Args:
        reminder_offset: The reminder offset (if any)
        due_date: The due date (if any)

    Raises:
        TaskValidationError: If reminder is set without due date
    """
    if reminder_offset is not None and due_date is None:
        raise TaskValidationError(
            "Cannot set reminder without a due date",
            ERR_TASK_013,
        )


def reminder_offset_to_timedelta(offset: str) -> timedelta:
    """Convert reminder offset string to timedelta.

    Args:
        offset: Validated reminder offset (15m, 30m, 1h, 2h, 1d, 1w)

    Returns:
        Timedelta representing the offset
    """
    offset_map = {
        "15m": timedelta(minutes=15),
        "30m": timedelta(minutes=30),
        "1h": timedelta(hours=1),
        "2h": timedelta(hours=2),
        "1d": timedelta(days=1),
        "1w": timedelta(weeks=1),
    }

    return offset_map.get(offset.lower(), timedelta(hours=1))

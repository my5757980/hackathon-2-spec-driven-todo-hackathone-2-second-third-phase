# Generated from @specs/features/task-recurring-Due-Dates-and-reminders/spec.md
"""RecurringInterval enum for task recurrence patterns.

Defines valid recurrence patterns for tasks: none, daily, weekly, monthly.
"""

from enum import StrEnum


class RecurringInterval(StrEnum):
    """Enumeration of valid recurrence intervals.

    Attributes:
        NONE: One-time task (default)
        DAILY: Repeats every day
        WEEKLY: Repeats every 7 days
        MONTHLY: Repeats every month (same day)
    """

    NONE = "none"
    DAILY = "daily"
    WEEKLY = "weekly"
    MONTHLY = "monthly"

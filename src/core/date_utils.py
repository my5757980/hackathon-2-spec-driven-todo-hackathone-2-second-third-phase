# Generated from @specs/features/task-recurring-Due-Dates-and-reminders/spec.md
"""Date utility functions for recurring tasks.

Provides date arithmetic for adding intervals (day, week, month) to dates.
"""

from datetime import datetime, timedelta

from src.models.recurring_interval import RecurringInterval


def add_interval(date: datetime, interval: RecurringInterval) -> datetime:
    """Add a recurring interval to a date.

    Args:
        date: The base date to add to
        interval: The interval to add (daily, weekly, monthly)

    Returns:
        New datetime with interval added

    Raises:
        ValueError: If interval is NONE or invalid
    """
    if interval == RecurringInterval.NONE:
        raise ValueError("Cannot add interval NONE to date")

    if interval == RecurringInterval.DAILY:
        return date + timedelta(days=1)

    if interval == RecurringInterval.WEEKLY:
        return date + timedelta(weeks=1)

    if interval == RecurringInterval.MONTHLY:
        # Add one month, handling month boundaries
        month = date.month + 1
        year = date.year
        if month > 12:
            month = 1
            year += 1

        # Handle day overflow (e.g., Jan 31 + 1 month = Feb 28/29)
        day = date.day
        while True:
            try:
                return date.replace(year=year, month=month, day=day)
            except ValueError:
                day -= 1
                if day < 1:
                    raise ValueError(f"Cannot add month to date {date}")

    raise ValueError(f"Invalid interval: {interval}")

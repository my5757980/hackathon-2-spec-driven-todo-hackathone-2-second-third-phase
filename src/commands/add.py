# Generated from @specs/features/task-recurring-Due-Dates-and-reminders/spec.md
"""Add command for creating new tasks."""

from datetime import datetime

import click

from src.core.validators import (
    parse_due_date,
    parse_recurring_interval,
    validate_reminder_offset,
    validate_reminder_with_due_date,
)
from src.errors import TaskValidationError
from src.models.recurring_interval import RecurringInterval


@click.command()
@click.argument("title")
@click.option("--description", "-d", help="Optional task description")
@click.option(
    "--recurring",
    type=click.Choice(["daily", "weekly", "monthly"], case_sensitive=False),
    help="Recurrence interval: daily, weekly, monthly",
)
@click.option(
    "--due",
    help='Due date in YYYY-MM-DD or "YYYY-MM-DD HH:MM" format',
)
@click.option(
    "--remind",
    type=click.Choice(["15m", "30m", "1h", "2h", "1d", "1w"], case_sensitive=False),
    help="Reminder offset: 15m, 30m, 1h, 2h, 1d, 1w",
)
@click.pass_context
def add(
    ctx: click.Context,
    title: str,
    description: str | None,
    recurring: str | None,
    due: str | None,
    remind: str | None,
) -> None:
    """Add a new task with the given TITLE.

    Example: todo add "Buy groceries" --description "Milk, eggs, bread"
    Example: todo add "Weekly meeting" --recurring weekly --due "2026-01-20 10:00" --remind 1h
    """
    service = ctx.obj["service"]
    verbose = ctx.obj.get("verbose", False)

    try:
        # Parse and validate optional fields
        due_date = None
        recurring_interval = None
        reminder_offset = None

        if due:
            due_date = parse_due_date(due)
            # Check for past date warning
            if due_date < datetime.now():
                click.echo("Note: Due date is in the past", err=True)

        if recurring:
            recurring_interval = parse_recurring_interval(recurring)
            # Convert "none" to None for storage
            if recurring_interval == RecurringInterval.NONE:
                recurring_interval = None

        if remind:
            reminder_offset = validate_reminder_offset(remind)

        # Validate reminder requires due date
        validate_reminder_with_due_date(reminder_offset, due_date)

        task = service.create_task(
            title=title,
            description=description,
            due_date=due_date,
            recurring_interval=recurring_interval,
            reminder_offset=reminder_offset,
        )

        # Build output message
        output_parts = [f"Task {task.id} created: {task.title}"]
        info_parts = []

        if task.recurring_interval:
            info_parts.append(f"Recurring: {task.recurring_interval.value}")
        if task.due_date:
            due_str = task.due_date.strftime("%Y-%m-%d %H:%M")
            if task.due_date.hour == 0 and task.due_date.minute == 0:
                due_str = task.due_date.strftime("%Y-%m-%d")
            info_parts.append(f"Due: {due_str}")
        if task.reminder_offset:
            info_parts.append(f"Reminder: {task.reminder_offset} before")

        if info_parts:
            output_parts.append(f"({', '.join(info_parts)})")

        click.echo(" ".join(output_parts))

        if verbose:
            click.echo(f"  Description: {task.description or '(none)'}")
            click.echo(f"  Created at: {task.created_at.strftime('%Y-%m-%d %H:%M:%S')}")

    except TaskValidationError as e:
        click.echo(f"Error: {e.message}", err=True)
        ctx.exit(1)

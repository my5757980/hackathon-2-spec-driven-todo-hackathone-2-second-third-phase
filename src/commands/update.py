# Generated from @specs/features/task-recurring-Due-Dates-and-reminders/spec.md
"""Update command for modifying existing tasks."""

from datetime import datetime

import click

from src.core.validators import (
    parse_due_date,
    parse_recurring_interval,
    validate_reminder_offset,
)
from src.errors import TaskNotFoundError, TaskValidationError
from src.models.recurring_interval import RecurringInterval


@click.command()
@click.argument("task_id", type=int)
@click.option("--title", "-t", help="New task title")
@click.option("--description", "-d", help="New task description")
@click.option(
    "--recurring",
    help='Recurrence interval: daily, weekly, monthly, or "none" to stop',
)
@click.option(
    "--due",
    help='Due date in YYYY-MM-DD or "YYYY-MM-DD HH:MM" format, or "none" to remove',
)
@click.option(
    "--remind",
    help='Reminder offset: 15m, 30m, 1h, 2h, 1d, 1w, or "none" to remove',
)
@click.pass_context
def update(
    ctx: click.Context,
    task_id: int,
    title: str | None,
    description: str | None,
    recurring: str | None,
    due: str | None,
    remind: str | None,
) -> None:
    """Update a task's properties.

    TASK_ID is the ID of the task to update.

    Example: todo update 1 --title "Updated title"
    Example: todo update 1 --recurring none  # Stop recurrence
    Example: todo update 1 --due 2026-01-30
    Example: todo update 1 --due none  # Remove due date
    """
    service = ctx.obj["service"]
    verbose = ctx.obj.get("verbose", False)

    try:
        # Parse recurring/due/remind values
        parsed_recurring = None
        parsed_due = None
        parsed_remind = None
        remove_due = False
        remove_recurring = False
        remove_remind = False

        if recurring is not None:
            if recurring.lower() == "none":
                remove_recurring = True
                parsed_recurring = RecurringInterval.NONE
            else:
                parsed_recurring = parse_recurring_interval(recurring)

        if due is not None:
            if due.lower() == "none":
                remove_due = True
                # Also remove reminder when due date is removed
                remove_remind = True
            else:
                parsed_due = parse_due_date(due)
                if parsed_due < datetime.now():
                    click.echo("Note: Due date is in the past", err=True)

        if remind is not None:
            if remind.lower() == "none":
                remove_remind = True
            else:
                parsed_remind = validate_reminder_offset(remind)

        task = service.update_task(
            task_id=task_id,
            title=title,
            description=description,
            due_date=parsed_due,
            recurring_interval=parsed_recurring,
            reminder_offset=parsed_remind,
            remove_due=remove_due,
            remove_recurring=remove_recurring,
            remove_remind=remove_remind,
        )

        # Generate output messages
        messages = []

        if remove_recurring:
            messages.append(
                f"Task {task.id} recurrence stopped. This is now a one-time task."
            )
        elif parsed_recurring and parsed_recurring != RecurringInterval.NONE:
            messages.append(
                f"Task {task.id} recurrence changed to {parsed_recurring.value}."
            )

        if remove_due:
            messages.append(f"Task {task.id} updated: Due date removed.")
        elif parsed_due:
            due_str = parsed_due.strftime("%Y-%m-%d %H:%M")
            if parsed_due.hour == 0 and parsed_due.minute == 0:
                due_str = parsed_due.strftime("%Y-%m-%d")
            messages.append(f"Task {task.id} updated: Due date set to {due_str}.")

        if remove_remind and not remove_due:
            messages.append(f"Task {task.id} updated: Reminder removed.")
        elif parsed_remind:
            messages.append(f"Task {task.id} updated: Reminder set to {parsed_remind}.")

        if title or description:
            messages.append(f"Task {task.id} updated.")

        if not messages:
            messages.append(f"Task {task.id} updated.")

        # Print unique messages
        for msg in dict.fromkeys(messages):
            click.echo(msg)

        if verbose:
            click.echo(f"  Title: {task.title}")
            click.echo(f"  Description: {task.description or '(none)'}")
            click.echo(
                f"  Recurring: {task.recurring_interval.value if task.recurring_interval else '(none)'}"
            )
            click.echo(
                f"  Due: {task.due_date.strftime('%Y-%m-%d %H:%M') if task.due_date else '(none)'}"
            )
            click.echo(f"  Reminder: {task.reminder_offset or '(none)'}")

    except TaskValidationError as e:
        click.echo(f"Error: {e.message}", err=True)
        ctx.exit(1)
    except TaskNotFoundError as e:
        click.echo(f"Error: {e.message}", err=True)
        ctx.exit(1)

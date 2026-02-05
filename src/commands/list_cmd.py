# Generated from @specs/features/task-recurring-Due-Dates-and-reminders/spec.md
"""List command for viewing all tasks.

Note: Named list_cmd.py to avoid conflict with Python's built-in list.
"""

from datetime import datetime, timedelta

import click

from src.core.validators import reminder_offset_to_timedelta
from src.models.task import Task


def format_task_table(tasks: list[Task], show_due_recurring: bool = True) -> str:
    """Format tasks as a table.

    Args:
        tasks: List of Task objects
        show_due_recurring: Whether to show Due and Recurring columns

    Returns:
        Formatted table string
    """
    if not tasks:
        return "No tasks found."

    now = datetime.now()

    # Calculate column widths
    id_width = max(len(str(t.id)) for t in tasks)
    id_width = max(id_width, 2)  # Minimum width for "ID"

    title_width = max(len(t.title) for t in tasks)
    title_width = min(max(title_width, 5), 40)  # Limit title width

    # Header
    if show_due_recurring:
        header = f"{'ID':<{id_width}}  {'Status':<8}  {'Title':<{title_width}}  {'Due':<14}  Recurring"
    else:
        header = f"{'ID':<{id_width}}  {'Status':<8}  {'Title':<{title_width}}  Created"
    separator = "-" * len(header)

    # Rows
    rows = []
    for task in tasks:
        status = "[x]" if task.completed else "[ ]"
        if len(task.title) > title_width:
            title = task.title[:title_width]
        else:
            title = task.title

        if show_due_recurring:
            # Format due date with overdue indicator
            if task.due_date:
                due_str = task.due_date.strftime("%Y-%m-%d")
                if task.due_date.hour != 0 or task.due_date.minute != 0:
                    due_str = task.due_date.strftime("%Y-%m-%d %H:%M")
                # Add overdue indicator
                if task.due_date < now and not task.completed:
                    due_str = due_str[:12] + " *"
            else:
                due_str = "-"

            # Format recurring
            recurring_str = task.recurring_interval.value if task.recurring_interval else "-"

            row = f"{task.id:<{id_width}}  {status:<8}  {title:<{title_width}}  {due_str:<14}  {recurring_str}"
        else:
            created = task.created_at.strftime("%Y-%m-%d")
            row = f"{task.id:<{id_width}}  {status:<8}  {title:<{title_width}}  {created}"
        rows.append(row)

    return "\n".join([header, separator] + rows)


def format_reminders(tasks: list[Task]) -> str:
    """Format upcoming reminders display.

    Args:
        tasks: List of Task objects with reminders

    Returns:
        Formatted reminders string
    """
    if not tasks:
        return "No upcoming reminders."

    lines = ["Upcoming Reminders (next 24 hours):", "-" * 35]

    for task in tasks:
        if task.due_date and task.reminder_offset:
            offset = reminder_offset_to_timedelta(task.reminder_offset)
            reminder_time = task.due_date - offset
            reminder_str = reminder_time.strftime("%Y-%m-%d %H:%M")
            lines.append(
                f"Task {task.id}: {task.title} - Reminder at {reminder_str} "
                f"({task.reminder_offset} before due)"
            )

    return "\n".join(lines)


@click.command("list")
@click.option(
    "--due",
    type=click.Choice(["today", "week", "overdue"], case_sensitive=False),
    help="Filter by due date: today, week, overdue",
)
@click.option(
    "--sort",
    "sort_by",
    type=click.Choice(["due", "created"], case_sensitive=False),
    help="Sort by: due, created",
)
@click.option(
    "--reminders",
    is_flag=True,
    help="Show upcoming reminders (next 24 hours)",
)
@click.pass_context
def list_tasks(
    ctx: click.Context,
    due: str | None,
    sort_by: str | None,
    reminders: bool,
) -> None:
    """List all tasks.

    Displays a table with ID, completion status, title, due date, and recurrence.

    Use --due to filter tasks by due date.
    Use --sort to sort tasks by due date or created date.
    Use --reminders to see upcoming reminders.
    """
    service = ctx.obj["service"]
    verbose = ctx.obj.get("verbose", False)

    if reminders:
        # Show reminders view
        tasks = service.get_upcoming_reminders()
        click.echo(format_reminders(tasks))
        return

    # Get tasks with optional filtering and sorting
    tasks = service.list_tasks(due_filter=due, sort_by=sort_by)

    if not tasks:
        click.echo("No tasks found.")
        return

    click.echo(format_task_table(tasks))

    if verbose:
        click.echo(f"\nTotal: {len(tasks)} task(s)")
        completed = sum(1 for t in tasks if t.completed)
        click.echo(f"Completed: {completed}, Pending: {len(tasks) - completed}")

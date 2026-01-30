# Generated from @specs/features/task-crud/spec.md
"""List command for viewing all tasks.

Note: Named list_cmd.py to avoid conflict with Python's built-in list.
"""

import click


def format_task_table(tasks: list) -> str:
    """Format tasks as a table.

    Args:
        tasks: List of Task objects

    Returns:
        Formatted table string
    """
    if not tasks:
        return "No tasks found."

    # Calculate column widths
    id_width = max(len(str(t.id)) for t in tasks)
    id_width = max(id_width, 2)  # Minimum width for "ID"

    title_width = max(len(t.title) for t in tasks)
    title_width = min(max(title_width, 5), 50)  # Limit title width

    # Header
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
        created = task.created_at.strftime("%Y-%m-%d")
        row = f"{task.id:<{id_width}}  {status:<8}  {title:<{title_width}}  {created}"
        rows.append(row)

    return "\n".join([header, separator] + rows)


@click.command("list")
@click.pass_context
def list_tasks(ctx: click.Context) -> None:
    """List all tasks.

    Displays a table with ID, completion status, title, and creation date.
    """
    service = ctx.obj["service"]
    verbose = ctx.obj.get("verbose", False)

    tasks = service.list_tasks()

    if not tasks:
        click.echo("No tasks found.")
        return

    click.echo(format_task_table(tasks))

    if verbose:
        click.echo(f"\nTotal: {len(tasks)} task(s)")
        completed = sum(1 for t in tasks if t.completed)
        click.echo(f"Completed: {completed}, Pending: {len(tasks) - completed}")

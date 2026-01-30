# Generated from @specs/features/task-crud/spec.md
"""Complete command for toggling task completion status."""

import click

from src.errors import TaskNotFoundError


@click.command()
@click.argument("task_id", type=int)
@click.pass_context
def complete(ctx: click.Context, task_id: int) -> None:
    """Toggle a task's completion status.

    TASK_ID is the ID of the task to toggle.

    Running this command on an incomplete task marks it as complete.
    Running it on a complete task marks it as pending.

    Example: todo complete 1
    """
    service = ctx.obj["service"]
    verbose = ctx.obj.get("verbose", False)

    try:
        task = service.toggle_complete(task_id)
        status = "complete" if task.completed else "pending"
        click.echo(f"Task {task.id} marked as {status}.")

        if verbose:
            click.echo(f"  Title: {task.title}")
            click.echo(f"  Completed: {task.completed}")

    except TaskNotFoundError as e:
        click.echo(f"Error: {e.message}", err=True)
        ctx.exit(1)

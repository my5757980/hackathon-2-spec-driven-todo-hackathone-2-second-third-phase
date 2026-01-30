# Generated from @specs/features/task-crud/spec.md
"""Delete command for removing tasks."""

import click

from src.errors import TaskNotFoundError


@click.command()
@click.argument("task_id", type=int)
@click.pass_context
def delete(ctx: click.Context, task_id: int) -> None:
    """Delete a task by ID.

    TASK_ID is the ID of the task to delete.

    Example: todo delete 1
    """
    service = ctx.obj["service"]
    verbose = ctx.obj.get("verbose", False)

    try:
        service.delete_task(task_id)
        click.echo(f"Task {task_id} deleted.")

        if verbose:
            click.echo("  Task has been permanently removed.")

    except TaskNotFoundError as e:
        click.echo(f"Error: {e.message}", err=True)
        ctx.exit(1)

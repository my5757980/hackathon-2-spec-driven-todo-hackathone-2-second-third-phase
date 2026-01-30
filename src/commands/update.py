# Generated from @specs/features/task-crud/spec.md
"""Update command for modifying existing tasks."""

import click

from src.errors import TaskNotFoundError, TaskValidationError


@click.command()
@click.argument("task_id", type=int)
@click.option("--title", "-t", help="New task title")
@click.option("--description", "-d", help="New task description")
@click.pass_context
def update(
    ctx: click.Context,
    task_id: int,
    title: str | None,
    description: str | None,
) -> None:
    """Update a task's title and/or description.

    TASK_ID is the ID of the task to update.

    Example: todo update 1 --title "Updated title"
    """
    service = ctx.obj["service"]
    verbose = ctx.obj.get("verbose", False)

    try:
        task = service.update_task(task_id, title, description)
        click.echo(f"Task {task.id} updated.")

        if verbose:
            click.echo(f"  Title: {task.title}")
            click.echo(f"  Description: {task.description or '(none)'}")

    except TaskValidationError as e:
        click.echo(f"Error: {e.message}", err=True)
        ctx.exit(1)
    except TaskNotFoundError as e:
        click.echo(f"Error: {e.message}", err=True)
        ctx.exit(1)

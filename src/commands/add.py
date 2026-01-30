# Generated from @specs/features/task-crud/spec.md
"""Add command for creating new tasks."""

import click

from src.errors import TaskValidationError


@click.command()
@click.argument("title")
@click.option("--description", "-d", help="Optional task description")
@click.pass_context
def add(ctx: click.Context, title: str, description: str | None) -> None:
    """Add a new task with the given TITLE.

    Example: todo add "Buy groceries" --description "Milk, eggs, bread"
    """
    service = ctx.obj["service"]
    verbose = ctx.obj.get("verbose", False)

    try:
        task = service.create_task(title, description)
        click.echo(f"Task {task.id} created: {task.title}")

        if verbose:
            click.echo(f"  Description: {task.description or '(none)'}")
            click.echo(f"  Created at: {task.created_at.strftime('%Y-%m-%d %H:%M:%S')}")

    except TaskValidationError as e:
        click.echo(f"Error: {e.message}", err=True)
        ctx.exit(1)

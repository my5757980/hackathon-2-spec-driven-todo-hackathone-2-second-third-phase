# Generated from @specs/features/task-crud/spec.md
"""CLI entry point for the Todo application.

Provides a Click-based command-line interface for task management.
"""

import click

from src.commands import add, complete, delete, list_tasks, update
from src.services.task_service import TaskService
from src.storage.task_store import TaskStore

# Global store instance (shared across commands in a session)
_store = TaskStore()


@click.group()
@click.option("--verbose", "-v", is_flag=True, help="Enable verbose output")
@click.pass_context
def cli(ctx: click.Context, verbose: bool) -> None:
    """Todo CLI - A simple task management application.

    Manage your tasks with commands like add, list, update, delete, and complete.
    All data is stored in memory and will be lost when the application exits.
    """
    ctx.ensure_object(dict)
    ctx.obj["verbose"] = verbose
    ctx.obj["service"] = TaskService(_store)


# Register commands
cli.add_command(add)
cli.add_command(list_tasks, name="list")
cli.add_command(update)
cli.add_command(delete)
cli.add_command(complete)


def main() -> None:
    """Main entry point for the CLI."""
    cli()


if __name__ == "__main__":
    main()

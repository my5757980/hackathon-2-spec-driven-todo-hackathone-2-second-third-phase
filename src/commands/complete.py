# Generated from @specs/features/task-recurring-Due-Dates-and-reminders/spec.md
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

    For recurring tasks, completing creates the next occurrence automatically.

    Example: todo complete 1
    """
    service = ctx.obj["service"]
    verbose = ctx.obj.get("verbose", False)

    try:
        task, next_task = service.complete_task(task_id)

        if task.completed:
            if next_task:
                # Recurring task completed with next occurrence
                if next_task.due_date:
                    due_str = next_task.due_date.strftime("%Y-%m-%d %H:%M")
                    if next_task.due_date.hour == 0 and next_task.due_date.minute == 0:
                        due_str = next_task.due_date.strftime("%Y-%m-%d")
                    click.echo(
                        f"Task {task.id} completed. "
                        f"Next occurrence (Task {next_task.id}) created for {due_str}."
                    )
                else:
                    click.echo(
                        f"Task {task.id} completed. "
                        f"Next occurrence (Task {next_task.id}) created."
                    )
            else:
                # Non-recurring task completed
                click.echo(f"Task {task.id} completed.")
        else:
            # Task marked as pending
            click.echo(f"Task {task.id} marked as pending.")

        if verbose:
            click.echo(f"  Title: {task.title}")
            click.echo(f"  Completed: {task.completed}")
            if next_task:
                click.echo(f"  Next task ID: {next_task.id}")

    except TaskNotFoundError as e:
        click.echo(f"Error: {e.message}", err=True)
        ctx.exit(1)

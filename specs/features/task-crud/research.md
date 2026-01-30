# Research: Task CRUD CLI Implementation

**Feature**: task-crud | **Date**: 2026-01-16 | **Phase**: 0

## Research Questions

### 1. Click Framework Patterns

**Question**: What is the best way to structure a Click CLI with multiple subcommands?

**Decision**: Use `@click.group()` with separate command files

**Rationale**:
- Click's group decorator creates a parent command that can host subcommands
- Each subcommand can be in its own file for modularity
- Commands are registered via `@cli.command()` or `cli.add_command()`

**Alternatives Considered**:
- Single file with all commands: Rejected due to file size and testing complexity
- Typer (Click wrapper): Rejected as spec mandates Click directly

**Code Pattern**:
```python
# main.py
import click
from src.commands import add, list_cmd, update, delete, complete

@click.group()
def cli():
    """Todo CLI - Manage your tasks from the command line."""
    pass

cli.add_command(add.add)
cli.add_command(list_cmd.list_tasks)
cli.add_command(update.update)
cli.add_command(delete.delete)
cli.add_command(complete.complete)

if __name__ == "__main__":
    cli()
```

### 2. Argument vs Option Usage

**Question**: When to use `@click.argument()` vs `@click.option()`?

**Decision**:
- Arguments for required positional values (task ID, title in add)
- Options for optional/named parameters (--description, --title in update)

**Rationale**:
- Arguments are positional and required by default
- Options use `--` prefix and are optional by default
- This matches the spec's command syntax exactly

**Code Pattern**:
```python
# add.py
@click.command()
@click.argument('title')
@click.option('--description', '-d', default=None, help='Task description')
def add(title: str, description: str | None):
    """Create a new task."""
    pass

# update.py
@click.command()
@click.argument('task_id', type=int)
@click.option('--title', '-t', default=None, help='New title')
@click.option('--description', '-d', default=None, help='New description')
def update(task_id: int, title: str | None, description: str | None):
    """Update an existing task."""
    pass
```

### 3. Error Handling in Click

**Question**: How to properly handle and display errors?

**Decision**: Use `click.echo()` with `err=True` and `sys.exit(1)`

**Rationale**:
- `click.echo(..., err=True)` writes to stderr
- Constitution X requires errors to stderr with exit code >0
- Click handles encoding issues across platforms

**Code Pattern**:
```python
import click
import sys

def handle_error(message: str, code: str) -> None:
    """Print error to stderr and exit."""
    click.echo(f"Error: {message}", err=True)
    sys.exit(1)

# Usage
try:
    result = task_service.create_task(title, description)
except ValidationError as e:
    handle_error(str(e), e.code)
```

### 4. Storage Data Structure

**Question**: Should tasks be stored in a list or dict?

**Decision**: Dict with int keys (task IDs)

**Rationale**:
- O(1) lookup by ID for get, update, delete operations
- List would require O(n) scan to find task by ID
- Dict preserves insertion order in Python 3.7+

**Alternatives Considered**:
- List of Task objects: Rejected due to O(n) lookups
- OrderedDict: Unnecessary in Python 3.7+ (regular dict preserves order)

**Data Structure**:
```python
class TaskStore:
    def __init__(self):
        self._tasks: dict[int, Task] = {}
        self._next_id: int = 1
```

### 5. Task Model Implementation

**Question**: Plain dict, TypedDict, or dataclass for Task?

**Decision**: `@dataclass` from standard library

**Rationale**:
- Type hints provide IDE support and documentation
- Auto-generated `__init__`, `__repr__`, `__eq__`
- Easy migration to SQLModel in Phase 2 (similar syntax)
- Standard library, no additional dependencies

**Alternatives Considered**:
- Plain dict: Rejected due to lack of type safety
- TypedDict: Rejected as it's just a type hint, not a runtime class
- Pydantic: Rejected as overkill for Phase 1; adds dependency
- attrs: Rejected as dataclass is sufficient and built-in

**Code Pattern**:
```python
from dataclasses import dataclass, field
from datetime import datetime

@dataclass
class Task:
    id: int
    title: str
    description: str | None = None
    completed: bool = False
    created_at: datetime = field(default_factory=datetime.now)
```

### 6. Output Formatting for List Command

**Question**: How to format the task list output?

**Decision**: Simple formatted string with alignment

**Rationale**:
- No external dependency needed (no tabulate, rich)
- Matches spec example output exactly
- Easy to test and modify

**Code Pattern**:
```python
def format_task_list(tasks: list[Task]) -> str:
    if not tasks:
        return "No tasks found."

    header = f"{'ID':<4}{'Status':<8}{'Title':<20}{'Created':<12}"
    divider = f"{'--':<4}{'------':<8}{'-----':<20}{'-------':<12}"

    lines = [header, divider]
    for task in tasks:
        status = "[x]" if task.completed else "[ ]"
        date = task.created_at.strftime("%Y-%m-%d")
        lines.append(f"{task.id:<4}{status:<8}{task.title:<20}{date:<12}")

    return "\n".join(lines)
```

## Dependencies Validated

| Dependency | Version | Purpose | Validation |
|------------|---------|---------|------------|
| Python | 3.13+ | Runtime | `python --version` |
| Click | 8.1+ | CLI framework | `pip show click` |
| pytest | 8.0+ | Testing | `pip show pytest` (dev only) |
| ruff | 0.4+ | Linting | `pip show ruff` (dev only) |

## References

- [Click Documentation](https://click.palletsprojects.com/)
- [Click GitHub Repository](https://github.com/pallets/click)
- [Real Python: Click Tutorial](https://realpython.com/python-click/)
- [Better Stack: Click Explained](https://betterstack.com/community/guides/scaling-python/click-explained/)
- [Python Dataclasses](https://docs.python.org/3/library/dataclasses.html)

---

**Generated from**: @specs/features/task-crud/spec.md

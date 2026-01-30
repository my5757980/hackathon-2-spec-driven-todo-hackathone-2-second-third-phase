# Quickstart: Task CRUD CLI

**Feature**: task-crud | **Date**: 2026-01-16 | **Phase**: 1

## Prerequisites

- Python 3.13+
- pip (Python package manager)

Verify Python version:
```bash
python --version  # Should be 3.13 or higher
```

## Installation

1. **Clone and navigate to project**:
   ```bash
   cd todo-app
   ```

2. **Create virtual environment** (recommended):
   ```bash
   python -m venv .venv
   source .venv/bin/activate  # Linux/macOS
   # or
   .venv\Scripts\activate     # Windows
   ```

3. **Install in editable mode**:
   ```bash
   pip install -e .
   ```

## Usage

The CLI is invoked as `todo` (or `python -m src`):

### Get Help

```bash
todo --help
```

Output:
```
Usage: todo [OPTIONS] COMMAND [ARGS]...

  Todo CLI - Manage your tasks from the command line.

Options:
  --verbose  Enable debug output
  --help     Show this message and exit.

Commands:
  add       Create a new task
  complete  Toggle task completion status
  delete    Remove a task
  list      Display all tasks
  update    Modify an existing task
```

### Create a Task

```bash
# Basic task
todo add "Buy groceries"
# Output: Task 1 created: Buy groceries

# Task with description
todo add "Plan vacation" --description "Research flights and hotels for summer trip"
# Output: Task 2 created: Plan vacation
```

### List All Tasks

```bash
todo list
```

Output:
```
ID  Status  Title                Created
--  ------  -----                -------
1   [ ]     Buy groceries        2026-01-16
2   [ ]     Plan vacation        2026-01-16
```

Empty list:
```bash
todo list
# Output: No tasks found.
```

### Update a Task

```bash
# Update title
todo update 1 --title "Buy organic groceries"
# Output: Task 1 updated.

# Update description
todo update 2 --description "Book flights by March"
# Output: Task 2 updated.

# Update both
todo update 1 --title "Shop at farmers market" --description "Get fresh produce"
# Output: Task 1 updated.
```

### Delete a Task

```bash
todo delete 1
# Output: Task 1 deleted.
```

### Mark Task Complete/Pending

```bash
# Mark as complete
todo complete 1
# Output: Task 1 marked as complete.

# Toggle back to pending
todo complete 1
# Output: Task 1 marked as pending.
```

## Error Handling

| Scenario | Command | Error |
|----------|---------|-------|
| Empty title | `todo add ""` | `Error: Title is required` |
| Title too long | `todo add "a"*201` | `Error: Title must be 200 characters or less` |
| Task not found | `todo delete 999` | `Error: Task not found: 999` |
| Invalid ID | `todo delete abc` | `Error: Invalid task ID` |
| No update fields | `todo update 1` | `Error: No updates provided. Use --title or --description.` |

## Development

### Run Tests

```bash
# Unit tests
pytest tests/unit/

# With coverage
pytest tests/unit/ --cov=src/
```

### Lint Code

```bash
# Check
ruff check src/

# Format check
ruff format --check src/

# Auto-fix
ruff check src/ --fix
ruff format src/
```

### Debug Mode

```bash
todo --verbose add "Debug task"
# Shows additional debug information
```

## Important Notes

- **Data is not persistent**: All tasks are stored in memory and lost when the program exits
- **Single session**: Each `todo` command starts fresh (no persistence between commands)
- For persistent storage, see Phase 2 (database integration)

## Troubleshooting

### "Command not found: todo"

Ensure you installed the package:
```bash
pip install -e .
```

Or run directly:
```bash
python -m src --help
```

### "ModuleNotFoundError: No module named 'click'"

Install dependencies:
```bash
pip install click
# or
pip install -e .
```

### "Invalid task ID" for valid-looking ID

Ensure the ID is a positive integer and the task exists:
```bash
todo list  # Check available task IDs
```

---

**Generated from**: @specs/features/task-crud/spec.md

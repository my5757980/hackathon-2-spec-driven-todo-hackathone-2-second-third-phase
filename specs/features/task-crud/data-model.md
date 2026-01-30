# Data Model: Task CRUD Operations

**Feature**: task-crud | **Date**: 2026-01-16 | **Phase**: 1

## Task Entity

### Schema

| Field | Type | Required | Default | Constraints | Description |
|-------|------|----------|---------|-------------|-------------|
| `id` | `int` | Yes | Auto-assigned | Unique, positive, auto-increment from 1 | Unique task identifier |
| `title` | `str` | Yes | - | 1-200 characters, non-empty | Task name/summary |
| `description` | `str \| None` | No | `None` | Max 1000 characters | Additional details |
| `completed` | `bool` | Yes | `False` | - | Completion status |
| `created_at` | `datetime` | Yes | `datetime.now()` | - | Creation timestamp |

### Python Implementation

```python
# src/models/task.py
# Generated from @specs/features/task-crud/spec.md

from dataclasses import dataclass, field
from datetime import datetime


@dataclass
class Task:
    """
    Represents a todo task.

    Attributes:
        id: Unique identifier (auto-assigned by storage layer)
        title: Task name (1-200 characters, required)
        description: Additional details (max 1000 characters, optional)
        completed: Whether task is done (default: False)
        created_at: When task was created (auto-set)
    """
    id: int
    title: str
    description: str | None = None
    completed: bool = False
    created_at: datetime = field(default_factory=datetime.now)
```

### Validation Rules

| Field | Rule | Error Code | Error Message |
|-------|------|------------|---------------|
| `title` | Cannot be empty | `ERR_TASK_001` | `Error: Title is required` |
| `title` | Max 200 characters | `ERR_TASK_002` | `Error: Title must be 200 characters or less` |
| `description` | Max 1000 characters | `ERR_TASK_003` | `Error: Description must be 1000 characters or less` |

### Validation Implementation

```python
# src/models/task.py (continued)

class TaskValidationError(Exception):
    """Raised when task validation fails."""
    def __init__(self, message: str, code: str):
        super().__init__(message)
        self.code = code
        self.message = message


def validate_title(title: str) -> str:
    """
    Validate task title.

    Args:
        title: The title to validate

    Returns:
        The validated title (stripped)

    Raises:
        TaskValidationError: If title is empty or too long
    """
    title = title.strip()
    if not title:
        raise TaskValidationError("Title is required", "ERR_TASK_001")
    if len(title) > 200:
        raise TaskValidationError(
            "Title must be 200 characters or less",
            "ERR_TASK_002"
        )
    return title


def validate_description(description: str | None) -> str | None:
    """
    Validate task description.

    Args:
        description: The description to validate (can be None)

    Returns:
        The validated description (stripped) or None

    Raises:
        TaskValidationError: If description is too long
    """
    if description is None:
        return None
    description = description.strip()
    if not description:
        return None
    if len(description) > 1000:
        raise TaskValidationError(
            "Description must be 1000 characters or less",
            "ERR_TASK_003"
        )
    return description
```

## Storage Layer

### Interface

```python
# src/storage/task_store.py
# Generated from @specs/features/task-crud/spec.md

from src.models.task import Task


class TaskStore:
    """
    In-memory storage for tasks.

    Uses a dict for O(1) lookups by ID.
    IDs are auto-incremented starting from 1.
    """

    def __init__(self) -> None:
        self._tasks: dict[int, Task] = {}
        self._next_id: int = 1

    def add(self, title: str, description: str | None = None) -> Task:
        """Create and store a new task. Returns the created task with ID assigned."""
        ...

    def get_all(self) -> list[Task]:
        """Return all tasks sorted by ID (creation order)."""
        ...

    def get_by_id(self, task_id: int) -> Task | None:
        """Return task by ID or None if not found."""
        ...

    def update(self, task_id: int, title: str | None = None,
               description: str | None = None) -> Task | None:
        """Update task fields. Returns updated task or None if not found."""
        ...

    def delete(self, task_id: int) -> bool:
        """Delete task. Returns True if deleted, False if not found."""
        ...

    def toggle_complete(self, task_id: int) -> Task | None:
        """Toggle task completion status. Returns task or None if not found."""
        ...
```

## State Transitions

```text
                    create_task()
                         │
                         ▼
    ┌─────────────────────────────────────┐
    │           Task Created              │
    │     completed = False               │
    │     created_at = now()              │
    └──────────────┬──────────────────────┘
                   │
         ┌─────────┴─────────┬─────────────────┐
         │                   │                 │
         ▼                   ▼                 ▼
   update_task()      toggle_complete()   delete_task()
         │                   │                 │
         ▼                   ▼                 ▼
   ┌───────────┐       ┌───────────┐     ┌───────────┐
   │ Modified  │       │ Toggled   │     │  Deleted  │
   │ (same ID) │       │ completed │     │ (removed) │
   └───────────┘       └─────┬─────┘     └───────────┘
                             │
                 ┌───────────┴───────────┐
                 │                       │
                 ▼                       ▼
          ┌───────────┐           ┌───────────┐
          │ completed │           │  pending  │
          │  = True   │◄─────────►│  = False  │
          └───────────┘  toggle   └───────────┘
```

## ID Generation

- IDs are positive integers starting from 1
- Auto-incremented: each new task gets `_next_id`, then `_next_id += 1`
- IDs are never reused (deleted task IDs remain unused)
- Gap in IDs is acceptable after deletions

```python
def add(self, title: str, description: str | None = None) -> Task:
    task = Task(
        id=self._next_id,
        title=title,
        description=description
    )
    self._tasks[self._next_id] = task
    self._next_id += 1
    return task
```

## Phase 2 Migration Notes

For Phase 2 (FastAPI + SQLModel), the `Task` dataclass will be replaced with:

```python
# Future Phase 2 implementation
from sqlmodel import SQLModel, Field
from datetime import datetime

class Task(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    title: str = Field(max_length=200)
    description: str | None = Field(default=None, max_length=1000)
    completed: bool = Field(default=False)
    created_at: datetime = Field(default_factory=datetime.now)
```

The service layer interface remains unchanged, enabling seamless migration.

---

**Generated from**: @specs/features/task-crud/spec.md

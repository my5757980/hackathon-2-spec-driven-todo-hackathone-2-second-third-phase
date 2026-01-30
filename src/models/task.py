# Generated from @specs/features/task-crud/spec.md
"""Task dataclass and validation functions.

The Task entity represents a todo item with the following properties:
- id: Unique auto-incrementing integer identifier
- title: Required string (1-200 characters)
- description: Optional string (max 1000 characters)
- completed: Boolean completion status (default: False)
- created_at: Timestamp of creation
"""

from dataclasses import dataclass, field
from datetime import datetime

from src.errors import ERR_TASK_001, ERR_TASK_002, ERR_TASK_003, TaskValidationError


@dataclass
class Task:
    """Represents a todo task.

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


def validate_title(title: str) -> str:
    """Validate task title.

    Args:
        title: The title to validate

    Returns:
        The validated title (stripped)

    Raises:
        TaskValidationError: If title is empty or too long
    """
    title = title.strip()
    if not title:
        raise TaskValidationError("Title is required", ERR_TASK_001)
    if len(title) > 200:
        raise TaskValidationError("Title must be 200 characters or less", ERR_TASK_002)
    return title


def validate_description(description: str | None) -> str | None:
    """Validate task description.

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
            "Description must be 1000 characters or less", ERR_TASK_003
        )
    return description

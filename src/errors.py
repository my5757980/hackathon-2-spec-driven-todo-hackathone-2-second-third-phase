# Generated from @specs/features/task-crud/spec.md
"""Custom exception classes with error codes.

Error codes follow the pattern ERR_TASK_NNN as defined in the spec.
"""


class TaskValidationError(Exception):
    """Raised when task validation fails."""

    def __init__(self, message: str, code: str):
        super().__init__(message)
        self.code = code
        self.message = message


class TaskNotFoundError(Exception):
    """Raised when a task is not found."""

    def __init__(self, task_id: int):
        super().__init__(f"Task not found: {task_id}")
        self.code = "ERR_TASK_004"
        self.task_id = task_id
        self.message = f"Task not found: {task_id}"


# Error code constants
ERR_TASK_001 = "ERR_TASK_001"  # Empty title
ERR_TASK_002 = "ERR_TASK_002"  # Title too long
ERR_TASK_003 = "ERR_TASK_003"  # Description too long
ERR_TASK_004 = "ERR_TASK_004"  # Task not found
ERR_TASK_005 = "ERR_TASK_005"  # Invalid ID format
ERR_TASK_006 = "ERR_TASK_006"  # No update fields provided
ERR_TASK_010 = "ERR_TASK_010"  # Invalid date format
ERR_TASK_011 = "ERR_TASK_011"  # Invalid recurrence interval
ERR_TASK_012 = "ERR_TASK_012"  # Invalid reminder offset
ERR_TASK_013 = "ERR_TASK_013"  # Reminder without due date

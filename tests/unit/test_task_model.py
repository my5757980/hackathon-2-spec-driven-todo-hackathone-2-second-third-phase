# Generated from @specs/features/task-crud/spec.md
"""Unit tests for Task model and validation functions."""

import pytest
from datetime import datetime

from src.models.task import Task, validate_title, validate_description
from src.errors import TaskValidationError


class TestTask:
    """Tests for the Task dataclass."""

    def test_task_creation_with_defaults(self):
        """Task should have default values for optional fields."""
        task = Task(id=1, title="Test task")

        assert task.id == 1
        assert task.title == "Test task"
        assert task.description is None
        assert task.completed is False
        assert isinstance(task.created_at, datetime)

    def test_task_creation_with_all_fields(self):
        """Task should accept all field values."""
        now = datetime.now()
        task = Task(
            id=1,
            title="Test task",
            description="Test description",
            completed=True,
            created_at=now,
        )

        assert task.id == 1
        assert task.title == "Test task"
        assert task.description == "Test description"
        assert task.completed is True
        assert task.created_at == now


class TestValidateTitle:
    """Tests for validate_title function."""

    def test_valid_title(self):
        """Valid title should be returned stripped."""
        result = validate_title("  Test task  ")
        assert result == "Test task"

    def test_empty_title_raises_error(self):
        """Empty title should raise TaskValidationError."""
        with pytest.raises(TaskValidationError) as exc_info:
            validate_title("")

        assert exc_info.value.code == "ERR_TASK_001"
        assert exc_info.value.message == "Title is required"

    def test_whitespace_only_title_raises_error(self):
        """Whitespace-only title should raise TaskValidationError."""
        with pytest.raises(TaskValidationError) as exc_info:
            validate_title("   ")

        assert exc_info.value.code == "ERR_TASK_001"

    def test_title_at_max_length(self):
        """Title at exactly 200 characters should be valid."""
        title = "a" * 200
        result = validate_title(title)
        assert result == title

    def test_title_exceeds_max_length(self):
        """Title exceeding 200 characters should raise error."""
        title = "a" * 201
        with pytest.raises(TaskValidationError) as exc_info:
            validate_title(title)

        assert exc_info.value.code == "ERR_TASK_002"
        assert exc_info.value.message == "Title must be 200 characters or less"


class TestValidateDescription:
    """Tests for validate_description function."""

    def test_none_description(self):
        """None description should return None."""
        result = validate_description(None)
        assert result is None

    def test_valid_description(self):
        """Valid description should be returned stripped."""
        result = validate_description("  Test description  ")
        assert result == "Test description"

    def test_empty_description_returns_none(self):
        """Empty description should return None."""
        result = validate_description("")
        assert result is None

    def test_whitespace_only_description_returns_none(self):
        """Whitespace-only description should return None."""
        result = validate_description("   ")
        assert result is None

    def test_description_at_max_length(self):
        """Description at exactly 1000 characters should be valid."""
        desc = "a" * 1000
        result = validate_description(desc)
        assert result == desc

    def test_description_exceeds_max_length(self):
        """Description exceeding 1000 characters should raise error."""
        desc = "a" * 1001
        with pytest.raises(TaskValidationError) as exc_info:
            validate_description(desc)

        assert exc_info.value.code == "ERR_TASK_003"
        assert exc_info.value.message == "Description must be 1000 characters or less"

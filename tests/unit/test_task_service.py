# Generated from @specs/features/task-crud/spec.md
"""Unit tests for TaskService."""

import pytest

from src.services.task_service import TaskService
from src.errors import TaskValidationError, TaskNotFoundError


class TestTaskServiceCreate:
    """Tests for TaskService.create_task."""

    def test_create_task_with_title(self):
        """Create should work with just a title."""
        service = TaskService()
        task = service.create_task("Test task")

        assert task.id == 1
        assert task.title == "Test task"
        assert task.description is None

    def test_create_task_with_description(self):
        """Create should work with title and description."""
        service = TaskService()
        task = service.create_task("Test task", "Test description")

        assert task.title == "Test task"
        assert task.description == "Test description"

    def test_create_validates_empty_title(self):
        """Create should reject empty title."""
        service = TaskService()

        with pytest.raises(TaskValidationError) as exc_info:
            service.create_task("")

        assert exc_info.value.code == "ERR_TASK_001"

    def test_create_validates_long_title(self):
        """Create should reject title over 200 characters."""
        service = TaskService()

        with pytest.raises(TaskValidationError) as exc_info:
            service.create_task("a" * 201)

        assert exc_info.value.code == "ERR_TASK_002"

    def test_create_validates_long_description(self):
        """Create should reject description over 1000 characters."""
        service = TaskService()

        with pytest.raises(TaskValidationError) as exc_info:
            service.create_task("Title", "a" * 1001)

        assert exc_info.value.code == "ERR_TASK_003"

    def test_create_sets_created_at(self):
        """Create should set created_at timestamp."""
        service = TaskService()
        task = service.create_task("Test task")

        assert task.created_at is not None


class TestTaskServiceList:
    """Tests for TaskService.list_tasks."""

    def test_list_empty(self):
        """List should return empty list when no tasks."""
        service = TaskService()
        tasks = service.list_tasks()
        assert tasks == []

    def test_list_returns_all_tasks(self):
        """List should return all created tasks."""
        service = TaskService()
        service.create_task("Task 1")
        service.create_task("Task 2")
        service.create_task("Task 3")

        tasks = service.list_tasks()
        assert len(tasks) == 3


class TestTaskServiceUpdate:
    """Tests for TaskService.update_task."""

    def test_update_title(self):
        """Update should change task title."""
        service = TaskService()
        task = service.create_task("Original")
        updated = service.update_task(task.id, title="Updated")

        assert updated.title == "Updated"

    def test_update_description(self):
        """Update should change task description."""
        service = TaskService()
        task = service.create_task("Task")
        updated = service.update_task(task.id, description="New desc")

        assert updated.description == "New desc"

    def test_update_no_fields_raises_error(self):
        """Update should fail if no fields provided."""
        service = TaskService()
        task = service.create_task("Task")

        with pytest.raises(TaskValidationError) as exc_info:
            service.update_task(task.id)

        assert exc_info.value.code == "ERR_TASK_006"
        assert "No updates provided" in exc_info.value.message

    def test_update_not_found(self):
        """Update should fail for non-existent task."""
        service = TaskService()

        with pytest.raises(TaskNotFoundError) as exc_info:
            service.update_task(999, title="New")

        assert exc_info.value.task_id == 999

    def test_update_validates_title(self):
        """Update should validate new title."""
        service = TaskService()
        task = service.create_task("Task")

        with pytest.raises(TaskValidationError) as exc_info:
            service.update_task(task.id, title="")

        assert exc_info.value.code == "ERR_TASK_001"


class TestTaskServiceDelete:
    """Tests for TaskService.delete_task."""

    def test_delete_existing(self):
        """Delete should remove the task."""
        service = TaskService()
        task = service.create_task("Task")

        service.delete_task(task.id)

        with pytest.raises(TaskNotFoundError):
            service.get_task(task.id)

    def test_delete_not_found(self):
        """Delete should fail for non-existent task."""
        service = TaskService()

        with pytest.raises(TaskNotFoundError) as exc_info:
            service.delete_task(999)

        assert exc_info.value.task_id == 999


class TestTaskServiceToggle:
    """Tests for TaskService.toggle_complete."""

    def test_toggle_to_complete(self):
        """Toggle should mark task as complete."""
        service = TaskService()
        task = service.create_task("Task")

        toggled = service.toggle_complete(task.id)
        assert toggled.completed is True

    def test_toggle_to_pending(self):
        """Toggle should mark complete task as pending."""
        service = TaskService()
        task = service.create_task("Task")
        service.toggle_complete(task.id)  # Complete

        toggled = service.toggle_complete(task.id)  # Back to pending
        assert toggled.completed is False

    def test_toggle_not_found(self):
        """Toggle should fail for non-existent task."""
        service = TaskService()

        with pytest.raises(TaskNotFoundError) as exc_info:
            service.toggle_complete(999)

        assert exc_info.value.task_id == 999

# Generated from @specs/features/task-crud/spec.md
"""Unit tests for TaskStore."""

import pytest

from src.storage.task_store import TaskStore


class TestTaskStore:
    """Tests for TaskStore class."""

    def test_id_generation_starts_at_one(self):
        """First task should have ID 1."""
        store = TaskStore()
        task = store.add("First task")
        assert task.id == 1

    def test_id_auto_increments(self):
        """IDs should auto-increment for each new task."""
        store = TaskStore()
        task1 = store.add("First task")
        task2 = store.add("Second task")
        task3 = store.add("Third task")

        assert task1.id == 1
        assert task2.id == 2
        assert task3.id == 3

    def test_ids_not_reused_after_delete(self):
        """Deleted task IDs should not be reused."""
        store = TaskStore()
        task1 = store.add("First task")
        store.delete(task1.id)
        task2 = store.add("Second task")

        assert task2.id == 2  # Not 1

    def test_add_creates_task(self):
        """Add should create a task with given values."""
        store = TaskStore()
        task = store.add("Test title", "Test description")

        assert task.title == "Test title"
        assert task.description == "Test description"
        assert task.completed is False

    def test_add_without_description(self):
        """Add should work without description."""
        store = TaskStore()
        task = store.add("Test title")

        assert task.title == "Test title"
        assert task.description is None

    def test_get_all_empty(self):
        """Get all on empty store should return empty list."""
        store = TaskStore()
        assert store.get_all() == []

    def test_get_all_returns_tasks_sorted_by_id(self):
        """Get all should return tasks sorted by ID."""
        store = TaskStore()
        store.add("Task 3")
        store.add("Task 1")
        store.add("Task 2")

        tasks = store.get_all()
        assert len(tasks) == 3
        assert tasks[0].id == 1
        assert tasks[1].id == 2
        assert tasks[2].id == 3

    def test_get_by_id_existing(self):
        """Get by ID should return the task."""
        store = TaskStore()
        created = store.add("Test task")
        found = store.get_by_id(created.id)

        assert found is not None
        assert found.id == created.id
        assert found.title == created.title

    def test_get_by_id_not_found(self):
        """Get by ID should return None for non-existent task."""
        store = TaskStore()
        found = store.get_by_id(999)
        assert found is None

    def test_update_title(self):
        """Update should change task title."""
        store = TaskStore()
        task = store.add("Original title")
        updated = store.update(task.id, title="New title")

        assert updated is not None
        assert updated.title == "New title"

    def test_update_description(self):
        """Update should change task description."""
        store = TaskStore()
        task = store.add("Task", "Original desc")
        updated = store.update(task.id, description="New desc")

        assert updated is not None
        assert updated.description == "New desc"

    def test_update_not_found(self):
        """Update should return None for non-existent task."""
        store = TaskStore()
        updated = store.update(999, title="New title")
        assert updated is None

    def test_delete_existing(self):
        """Delete should remove task and return True."""
        store = TaskStore()
        task = store.add("Test task")

        result = store.delete(task.id)
        assert result is True
        assert store.get_by_id(task.id) is None

    def test_delete_not_found(self):
        """Delete should return False for non-existent task."""
        store = TaskStore()
        result = store.delete(999)
        assert result is False

    def test_toggle_complete_to_true(self):
        """Toggle should mark incomplete task as complete."""
        store = TaskStore()
        task = store.add("Test task")
        assert task.completed is False

        toggled = store.toggle_complete(task.id)
        assert toggled is not None
        assert toggled.completed is True

    def test_toggle_complete_to_false(self):
        """Toggle should mark complete task as incomplete."""
        store = TaskStore()
        task = store.add("Test task")
        store.toggle_complete(task.id)  # Now complete
        toggled = store.toggle_complete(task.id)  # Back to incomplete

        assert toggled is not None
        assert toggled.completed is False

    def test_toggle_complete_not_found(self):
        """Toggle should return None for non-existent task."""
        store = TaskStore()
        toggled = store.toggle_complete(999)
        assert toggled is None

# Phase 1 Manual Test Checklist

**Feature**: Task CRUD Operations
**Date**: 2026-01-23
**Tester**: ______________

## Setup

```bash
cd /path/to/todo-app
pip install -e .
```

## Test Cases

### US1: Add Task

- [ ] **TC01**: Add task with title only
  ```bash
  todo add "Buy groceries"
  ```
  **Expected**: `Task 1 created: Buy groceries`

- [ ] **TC02**: Add task with description
  ```bash
  todo add "Learn Python" --description "Complete Click tutorial"
  ```
  **Expected**: `Task 2 created: Learn Python`

- [ ] **TC03**: Add task with empty title
  ```bash
  todo add ""
  ```
  **Expected**: `Error: Title is required`

- [ ] **TC04**: Add task with title over 200 characters
  ```bash
  todo add "$(python -c 'print("a" * 201)')"
  ```
  **Expected**: `Error: Title must be 200 characters or less`

- [ ] **TC05**: Add task with description over 1000 characters
  ```bash
  todo add "Test" --description "$(python -c 'print("a" * 1001)')"
  ```
  **Expected**: `Error: Description must be 1000 characters or less`

### US2: List Tasks

- [ ] **TC06**: List tasks when empty
  ```bash
  todo list
  ```
  **Expected**: `No tasks found.`

- [ ] **TC07**: List tasks with data
  ```bash
  todo add "Task A"
  todo add "Task B"
  todo list
  ```
  **Expected**: Table with ID, Status, Title, Created columns

### US3: Update Task

- [ ] **TC08**: Update task title
  ```bash
  todo add "Original"
  todo update 1 --title "Updated"
  ```
  **Expected**: `Task 1 updated.`

- [ ] **TC09**: Update task description
  ```bash
  todo update 1 --description "New description"
  ```
  **Expected**: `Task 1 updated.`

- [ ] **TC10**: Update non-existent task
  ```bash
  todo update 999 --title "Test"
  ```
  **Expected**: `Error: Task not found: 999`

- [ ] **TC11**: Update with no options
  ```bash
  todo update 1
  ```
  **Expected**: `Error: No updates provided. Use --title or --description.`

### US4: Delete Task

- [ ] **TC12**: Delete existing task
  ```bash
  todo add "To delete"
  todo delete 1
  ```
  **Expected**: `Task 1 deleted.`

- [ ] **TC13**: Delete non-existent task
  ```bash
  todo delete 999
  ```
  **Expected**: `Error: Task not found: 999`

### US5: Complete Task

- [ ] **TC14**: Mark task as complete
  ```bash
  todo add "To complete"
  todo complete 1
  ```
  **Expected**: `Task 1 marked as complete.`

- [ ] **TC15**: Mark task as pending (toggle back)
  ```bash
  todo complete 1
  ```
  **Expected**: `Task 1 marked as pending.`

- [ ] **TC16**: Complete non-existent task
  ```bash
  todo complete 999
  ```
  **Expected**: `Error: Task not found: 999`

### General

- [ ] **TC17**: Help command works
  ```bash
  todo --help
  ```
  **Expected**: Shows usage and available commands

- [ ] **TC18**: Verbose flag works
  ```bash
  todo -v add "Verbose test"
  ```
  **Expected**: Shows additional details (description, created_at)

## Summary

| Category | Total | Passed | Failed |
|----------|-------|--------|--------|
| Add Task | 5 | | |
| List Tasks | 2 | | |
| Update Task | 4 | | |
| Delete Task | 2 | | |
| Complete Task | 3 | | |
| General | 2 | | |
| **TOTAL** | 18 | | |

## Notes

_Record any issues or observations here._

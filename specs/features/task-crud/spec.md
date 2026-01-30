# Feature: Task CRUD Operations

**Phase**: 1 (In-Memory Python Console CLI)
**Created**: 2026-01-16
**Status**: Draft

## User Stories

- As a user, I can add a new task with a title and optional description so that I can track items I need to complete.
- As a user, I can view all my tasks in a list so that I can see what needs to be done.
- As a user, I can update an existing task's title or description so that I can correct mistakes or add details.
- As a user, I can delete a task so that I can remove items I no longer need to track.
- As a user, I can mark a task as complete (or toggle it back to pending) so that I can track my progress.

## Acceptance Criteria

### Create Task

- Title is required (1-200 characters)
- Description is optional (max 1000 characters)
- System auto-assigns a unique incrementing integer ID starting from 1
- New tasks default to `completed = False`
- System records creation timestamp (`created_at`)
- Success message displays the new task ID

**Command**: `add <title> [--description <text>]`

**Examples**:
```
$ todo add "Buy groceries"
Task 1 created: Buy groceries

$ todo add "Plan vacation" --description "Research flights and hotels for summer trip"
Task 2 created: Plan vacation
```

**Error Cases**:
- Empty title → `Error: Title is required`
- Title > 200 chars → `Error: Title must be 200 characters or less`
- Description > 1000 chars → `Error: Description must be 1000 characters or less`

---

### View Tasks

- Display all tasks with: ID, title, status indicator, created date
- Status indicators: `[x]` for complete, `[ ]` for pending
- Show "No tasks found." when list is empty
- Tasks displayed in order of creation (by ID)

**Command**: `list`

**Example Output**:
```
$ todo list
ID  Status  Title                Created
--  ------  -----                -------
1   [ ]     Buy groceries        2026-01-16
2   [x]     Call mom             2026-01-16
3   [ ]     Plan vacation        2026-01-16

$ todo list
No tasks found.
```

---

### Update Task

- Can update title, description, or both
- At least one field must be provided for update
- Title validation same as create (1-200 chars, cannot be empty)
- Description validation same as create (max 1000 chars)
- Success message confirms the update

**Command**: `update <id> [--title <text>] [--description <text>]`

**Examples**:
```
$ todo update 1 --title "Buy organic groceries"
Task 1 updated.

$ todo update 2 --description "Call about birthday party"
Task 2 updated.

$ todo update 3 --title "Summer vacation" --description "Book flights by March"
Task 3 updated.
```

**Error Cases**:
- Task ID not found → `Error: Task not found: <id>`
- Invalid ID format → `Error: Invalid task ID`
- No options provided → `Error: No updates provided. Use --title or --description.`
- Empty title → `Error: Title cannot be empty`
- Title > 200 chars → `Error: Title must be 200 characters or less`

---

### Delete Task

- Permanently removes task from the list
- Success message confirms deletion with task ID

**Command**: `delete <id>`

**Examples**:
```
$ todo delete 1
Task 1 deleted.
```

**Error Cases**:
- Task ID not found → `Error: Task not found: <id>`
- Invalid ID format → `Error: Invalid task ID`

---

### Mark as Complete

- Toggles task status between complete and pending
- If pending → mark complete
- If complete → mark pending (toggle back)
- Success message shows new status

**Command**: `complete <id>`

**Examples**:
```
$ todo complete 1
Task 1 marked as complete.

$ todo complete 1
Task 1 marked as pending.
```

**Error Cases**:
- Task ID not found → `Error: Task not found: <id>`
- Invalid ID format → `Error: Invalid task ID`

---

## Constraints

- **Storage**: In-memory only (Python list or dict) - data lost on exit
- **Framework**: Click for CLI commands
- **Runtime**: Python 3.13+
- **Persistence**: None - no database, no file storage
- **Authentication**: None required for Phase 1
- **Concurrency**: Single-user, single-threaded operation

## Data Model

**Task Entity**:
| Field       | Type      | Required | Description                              |
|-------------|-----------|----------|------------------------------------------|
| id          | integer   | Yes      | Auto-incrementing unique identifier      |
| title       | string    | Yes      | Task name (1-200 characters)             |
| description | string    | No       | Additional details (max 1000 characters) |
| completed   | boolean   | Yes      | Completion status (default: False)       |
| created_at  | timestamp | Yes      | Creation date/time                       |

## CLI Commands Summary

| Command                                      | Description                    |
|----------------------------------------------|--------------------------------|
| `add <title> [--description <text>]`         | Create a new task              |
| `list`                                       | Display all tasks              |
| `update <id> [--title] [--description]`      | Modify an existing task        |
| `delete <id>`                                | Remove a task                  |
| `complete <id>`                              | Toggle task completion status  |

## Out of Scope (Phase 1)

- Persistent storage (database, file-based)
- User authentication
- Task categories or tags
- Due dates and reminders
- Priority levels
- Search and filtering
- Recurring tasks

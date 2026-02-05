# MCP Tools Specification

**Feature**: Todo AI Chatbot (Phase III)
**Created**: 2026-02-03
**Status**: Draft
**SDK**: Official MCP SDK

---

## Overview

This document specifies the 5 MCP tools required for the Todo AI Chatbot. All tools are designed to be:

- **Stateless**: No server-side session state; all context passed via parameters
- **User-isolated**: Every operation filtered by `user_id` for multi-user security
- **Consistent**: Uniform return format across all tools

### Task Model Reference

Tools interact with the existing Task model containing these fields:

| Field       | Type      | Description                          |
|-------------|-----------|--------------------------------------|
| id          | string    | Unique task identifier               |
| user_id     | string    | Owner's user identifier              |
| title       | string    | Task title/name                      |
| description | string    | Optional detailed description        |
| completed   | boolean   | Completion status (true/false)       |
| created_at  | timestamp | When the task was created            |
| updated_at  | timestamp | When the task was last modified      |

---

## Tool 1: add_task

**Purpose**: Create a new task for the authenticated user.

### Parameters

| Parameter   | Type   | Required | Description                              |
|-------------|--------|----------|------------------------------------------|
| user_id     | string | Yes      | The authenticated user's ID              |
| title       | string | Yes      | The title/name of the task               |
| description | string | No       | Optional detailed description of the task |

### Return Format (Success)

```json
{
  "success": true,
  "message": "Task '<title>' has been added.",
  "task": {
    "id": "<task_id>",
    "user_id": "<user_id>",
    "title": "<title>",
    "description": "<description>",
    "completed": false,
    "created_at": "<timestamp>",
    "updated_at": "<timestamp>"
  }
}
```

### Return Format (Error)

```json
{
  "success": false,
  "error": "validation_error",
  "message": "Title is required and cannot be empty."
}
```

### Example

**Input**:
```json
{
  "user_id": "user_123",
  "title": "Buy groceries",
  "description": "Milk, eggs, bread"
}
```

**Output**:
```json
{
  "success": true,
  "message": "Task 'Buy groceries' has been added.",
  "task": {
    "id": "task_456",
    "user_id": "user_123",
    "title": "Buy groceries",
    "description": "Milk, eggs, bread",
    "completed": false,
    "created_at": "2026-02-03T10:30:00Z",
    "updated_at": "2026-02-03T10:30:00Z"
  }
}
```

### Notes

- Tool is stateless; user_id must be provided explicitly
- Title is required and must be non-empty
- Description defaults to empty string if not provided
- New tasks are always created with `completed: false`

---

## Tool 2: list_tasks

**Purpose**: Retrieve all tasks belonging to the authenticated user, with optional status filtering.

### Parameters

| Parameter | Type   | Required | Description                                                      |
|-----------|--------|----------|------------------------------------------------------------------|
| user_id   | string | Yes      | The authenticated user's ID                                      |
| status    | string | No       | Filter by status: "all" (default), "pending", or "completed"     |

### Return Format (Success - with tasks)

```json
{
  "success": true,
  "message": "You have <count> task(s).",
  "tasks": [
    {
      "id": "<task_id>",
      "user_id": "<user_id>",
      "title": "<title>",
      "description": "<description>",
      "completed": <boolean>,
      "created_at": "<timestamp>",
      "updated_at": "<timestamp>"
    }
  ],
  "count": <number>,
  "filter": "<status>"
}
```

### Return Format (Success - empty list)

```json
{
  "success": true,
  "message": "You don't have any tasks yet.",
  "tasks": [],
  "count": 0,
  "filter": "all"
}
```

### Return Format (Success - filtered empty)

```json
{
  "success": true,
  "message": "You don't have any pending tasks.",
  "tasks": [],
  "count": 0,
  "filter": "pending"
}
```

### Return Format (Error)

```json
{
  "success": false,
  "error": "invalid_filter",
  "message": "Invalid status filter. Use 'all', 'pending', or 'completed'."
}
```

### Example

**Input**:
```json
{
  "user_id": "user_123",
  "status": "pending"
}
```

**Output**:
```json
{
  "success": true,
  "message": "You have 2 pending task(s).",
  "tasks": [
    {
      "id": "task_456",
      "user_id": "user_123",
      "title": "Buy groceries",
      "description": "Milk, eggs, bread",
      "completed": false,
      "created_at": "2026-02-03T10:30:00Z",
      "updated_at": "2026-02-03T10:30:00Z"
    },
    {
      "id": "task_789",
      "user_id": "user_123",
      "title": "Call mom",
      "description": "",
      "completed": false,
      "created_at": "2026-02-03T11:00:00Z",
      "updated_at": "2026-02-03T11:00:00Z"
    }
  ],
  "count": 2,
  "filter": "pending"
}
```

### Notes

- Tool is stateless; user_id must be provided explicitly
- Only returns tasks where `task.user_id == user_id` (multi-user isolation)
- Status filter values:
  - `"all"` (default): Returns all tasks regardless of completion status
  - `"pending"`: Returns only tasks where `completed == false`
  - `"completed"`: Returns only tasks where `completed == true`
- Tasks are returned in creation order (oldest first)

---

## Tool 3: complete_task

**Purpose**: Mark a specific task as complete.

### Parameters

| Parameter   | Type   | Required | Description                                            |
|-------------|--------|----------|--------------------------------------------------------|
| user_id     | string | Yes      | The authenticated user's ID                            |
| task_id     | string | No       | The specific task ID (if known)                        |
| title_match | string | No       | Partial title to match (if task_id not provided)       |

*Note: Either `task_id` OR `title_match` must be provided.*

### Return Format (Success)

```json
{
  "success": true,
  "message": "Task '<title>' has been marked as complete.",
  "task": {
    "id": "<task_id>",
    "user_id": "<user_id>",
    "title": "<title>",
    "description": "<description>",
    "completed": true,
    "created_at": "<timestamp>",
    "updated_at": "<timestamp>"
  }
}
```

### Return Format (Error - not found)

```json
{
  "success": false,
  "error": "task_not_found",
  "message": "I couldn't find a task matching '<search_term>'."
}
```

### Return Format (Error - multiple matches)

```json
{
  "success": false,
  "error": "multiple_matches",
  "message": "I found multiple tasks matching '<term>'. Which one did you mean?",
  "matches": [
    {
      "id": "<task_id_1>",
      "title": "<title_1>"
    },
    {
      "id": "<task_id_2>",
      "title": "<title_2>"
    }
  ]
}
```

### Return Format (Error - already complete)

```json
{
  "success": false,
  "error": "already_complete",
  "message": "Task '<title>' is already marked as complete."
}
```

### Return Format (Error - missing parameters)

```json
{
  "success": false,
  "error": "missing_parameter",
  "message": "Either task_id or title_match must be provided."
}
```

### Example

**Input (by title match)**:
```json
{
  "user_id": "user_123",
  "title_match": "groceries"
}
```

**Output**:
```json
{
  "success": true,
  "message": "Task 'Buy groceries' has been marked as complete.",
  "task": {
    "id": "task_456",
    "user_id": "user_123",
    "title": "Buy groceries",
    "description": "Milk, eggs, bread",
    "completed": true,
    "created_at": "2026-02-03T10:30:00Z",
    "updated_at": "2026-02-03T12:00:00Z"
  }
}
```

### Notes

- Tool is stateless; user_id must be provided explicitly
- Only completes tasks where `task.user_id == user_id` (multi-user isolation)
- Title matching is case-insensitive and supports partial/substring matches
- If multiple tasks match `title_match`, returns error with list of matches for disambiguation
- Updates `updated_at` timestamp when marking complete

---

## Tool 4: delete_task

**Purpose**: Remove a specific task permanently.

### Parameters

| Parameter   | Type   | Required | Description                                            |
|-------------|--------|----------|--------------------------------------------------------|
| user_id     | string | Yes      | The authenticated user's ID                            |
| task_id     | string | No       | The specific task ID (if known)                        |
| title_match | string | No       | Partial title to match (if task_id not provided)       |

*Note: Either `task_id` OR `title_match` must be provided.*

### Return Format (Success)

```json
{
  "success": true,
  "message": "Task '<title>' has been deleted.",
  "deleted_task": {
    "id": "<task_id>",
    "title": "<title>",
    "description": "<description>",
    "completed": <boolean>
  }
}
```

### Return Format (Error - not found)

```json
{
  "success": false,
  "error": "task_not_found",
  "message": "I couldn't find a task matching '<search_term>'."
}
```

### Return Format (Error - multiple matches)

```json
{
  "success": false,
  "error": "multiple_matches",
  "message": "I found multiple tasks matching '<term>'. Which one did you mean?",
  "matches": [
    {
      "id": "<task_id_1>",
      "title": "<title_1>"
    },
    {
      "id": "<task_id_2>",
      "title": "<title_2>"
    }
  ]
}
```

### Return Format (Error - missing parameters)

```json
{
  "success": false,
  "error": "missing_parameter",
  "message": "Either task_id or title_match must be provided."
}
```

### Example

**Input (by task_id)**:
```json
{
  "user_id": "user_123",
  "task_id": "task_456"
}
```

**Output**:
```json
{
  "success": true,
  "message": "Task 'Buy groceries' has been deleted.",
  "deleted_task": {
    "id": "task_456",
    "title": "Buy groceries",
    "description": "Milk, eggs, bread",
    "completed": false
  }
}
```

### Notes

- Tool is stateless; user_id must be provided explicitly
- Only deletes tasks where `task.user_id == user_id` (multi-user isolation)
- Title matching is case-insensitive and supports partial/substring matches
- If multiple tasks match `title_match`, returns error with list of matches for disambiguation
- Deletion is permanent; no soft-delete or undo

---

## Tool 5: update_task

**Purpose**: Update a task's title and/or description.

### Parameters

| Parameter       | Type   | Required | Description                                            |
|-----------------|--------|----------|--------------------------------------------------------|
| user_id         | string | Yes      | The authenticated user's ID                            |
| task_id         | string | No       | The specific task ID (if known)                        |
| title_match     | string | No       | Partial title to match (if task_id not provided)       |
| new_title       | string | No       | The new title for the task                             |
| new_description | string | No       | The new description for the task                       |

*Note: Either `task_id` OR `title_match` must be provided.*
*Note: At least one of `new_title` OR `new_description` must be provided.*

### Return Format (Success)

```json
{
  "success": true,
  "message": "Task '<old_title>' has been updated.",
  "task": {
    "id": "<task_id>",
    "user_id": "<user_id>",
    "title": "<new_title>",
    "description": "<new_description>",
    "completed": <boolean>,
    "created_at": "<timestamp>",
    "updated_at": "<timestamp>"
  },
  "changes": {
    "title": {
      "old": "<old_title>",
      "new": "<new_title>"
    },
    "description": {
      "old": "<old_description>",
      "new": "<new_description>"
    }
  }
}
```

*Note: `changes` object only includes fields that were actually modified.*

### Return Format (Error - not found)

```json
{
  "success": false,
  "error": "task_not_found",
  "message": "I couldn't find a task matching '<search_term>'."
}
```

### Return Format (Error - multiple matches)

```json
{
  "success": false,
  "error": "multiple_matches",
  "message": "I found multiple tasks matching '<term>'. Which one did you mean?",
  "matches": [
    {
      "id": "<task_id_1>",
      "title": "<title_1>"
    },
    {
      "id": "<task_id_2>",
      "title": "<title_2>"
    }
  ]
}
```

### Return Format (Error - no changes)

```json
{
  "success": false,
  "error": "no_changes",
  "message": "At least one of new_title or new_description must be provided."
}
```

### Return Format (Error - missing parameters)

```json
{
  "success": false,
  "error": "missing_parameter",
  "message": "Either task_id or title_match must be provided."
}
```

### Example (Update title only)

**Input**:
```json
{
  "user_id": "user_123",
  "title_match": "groceries",
  "new_title": "Buy organic groceries"
}
```

**Output**:
```json
{
  "success": true,
  "message": "Task 'Buy groceries' has been updated.",
  "task": {
    "id": "task_456",
    "user_id": "user_123",
    "title": "Buy organic groceries",
    "description": "Milk, eggs, bread",
    "completed": false,
    "created_at": "2026-02-03T10:30:00Z",
    "updated_at": "2026-02-03T14:00:00Z"
  },
  "changes": {
    "title": {
      "old": "Buy groceries",
      "new": "Buy organic groceries"
    }
  }
}
```

### Example (Update description only)

**Input**:
```json
{
  "user_id": "user_123",
  "task_id": "task_456",
  "new_description": "Organic milk, free-range eggs, sourdough bread"
}
```

**Output**:
```json
{
  "success": true,
  "message": "Task 'Buy organic groceries' has been updated.",
  "task": {
    "id": "task_456",
    "user_id": "user_123",
    "title": "Buy organic groceries",
    "description": "Organic milk, free-range eggs, sourdough bread",
    "completed": false,
    "created_at": "2026-02-03T10:30:00Z",
    "updated_at": "2026-02-03T14:30:00Z"
  },
  "changes": {
    "description": {
      "old": "Milk, eggs, bread",
      "new": "Organic milk, free-range eggs, sourdough bread"
    }
  }
}
```

### Example (Update both)

**Input**:
```json
{
  "user_id": "user_123",
  "task_id": "task_789",
  "new_title": "Call mom about birthday",
  "new_description": "Discuss party plans for Saturday"
}
```

**Output**:
```json
{
  "success": true,
  "message": "Task 'Call mom' has been updated.",
  "task": {
    "id": "task_789",
    "user_id": "user_123",
    "title": "Call mom about birthday",
    "description": "Discuss party plans for Saturday",
    "completed": false,
    "created_at": "2026-02-03T11:00:00Z",
    "updated_at": "2026-02-03T15:00:00Z"
  },
  "changes": {
    "title": {
      "old": "Call mom",
      "new": "Call mom about birthday"
    },
    "description": {
      "old": "",
      "new": "Discuss party plans for Saturday"
    }
  }
}
```

### Notes

- Tool is stateless; user_id must be provided explicitly
- Only updates tasks where `task.user_id == user_id` (multi-user isolation)
- Title matching is case-insensitive and supports partial/substring matches
- If multiple tasks match `title_match`, returns error with list of matches for disambiguation
- At least one of `new_title` or `new_description` must be provided
- Only fields provided are updated; omitted fields remain unchanged
- Updates `updated_at` timestamp on any successful change
- `changes` object in response only includes fields that were actually modified

---

## Error Code Reference

| Error Code          | HTTP Equivalent | Description                                      |
|---------------------|-----------------|--------------------------------------------------|
| validation_error    | 400             | Invalid input (e.g., empty title)                |
| missing_parameter   | 400             | Required parameter not provided                  |
| invalid_filter      | 400             | Invalid status filter value                      |
| no_changes          | 400             | No update fields provided                        |
| task_not_found      | 404             | No task matches the search criteria              |
| multiple_matches    | 409             | Multiple tasks match; disambiguation required    |
| already_complete    | 409             | Task is already in the requested state           |

---

## Common Design Patterns

### Multi-User Isolation

All tools enforce user isolation by:
1. Requiring `user_id` as a mandatory parameter
2. Filtering all database queries by `user_id`
3. Never exposing tasks from other users

### Task Identification

Tools that operate on a specific task support two identification methods:
1. **Direct ID**: Use `task_id` for precise targeting
2. **Title Search**: Use `title_match` for natural language queries

When using `title_match`:
- Matching is case-insensitive
- Partial/substring matches are supported
- Single match: Operation proceeds
- Multiple matches: Error with disambiguation options
- No matches: Task not found error

### Consistent Response Structure

All successful responses include:
- `success: true`
- `message`: Human-readable confirmation
- Task data (single `task` or array `tasks`)

All error responses include:
- `success: false`
- `error`: Machine-readable error code
- `message`: Human-readable error description
- Additional context when applicable (e.g., `matches` for disambiguation)

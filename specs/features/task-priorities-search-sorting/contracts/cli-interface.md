# CLI Interface Contract: Task Priorities, Search, and Sorting

**Feature**: task-priorities-search-sorting
**Date**: 2026-01-17
**Spec Reference**: @specs/features/task-priorities-search-sorting/spec.md

## Overview

This document defines the CLI interface contract for the task-priorities-search-sorting feature. Since Phase 1 is a CLI application (no REST API), this serves as the interface contract.

---

## Commands

### 1. add (Extended)

Create a new task with optional priority and tags.

**Signature**:
```
todo add <title> [--description TEXT] [--priority LEVEL] [--tag TAG]...
```

**Arguments**:
| Argument | Type | Required | Description |
|----------|------|----------|-------------|
| title | string | Yes | Task title (1-200 characters) |

**Options**:
| Option | Type | Default | Description |
|--------|------|---------|-------------|
| --description, -d | string | None | Task description (0-1000 characters) |
| --priority, -p | choice | medium | Priority level: high, medium, low |
| --tag, -t | string (multiple) | [] | Tag for categorization (can be repeated) |

**Output** (success):
```
Task <id> created: <title> (Priority: <priority>, Tags: <tags>)
```

**Output** (no tags):
```
Task <id> created: <title> (Priority: <priority>)
```

**Exit Codes**:
| Code | Condition |
|------|-----------|
| 0 | Success |
| 1 | Validation error (title too long, invalid priority, invalid tag) |

**Examples**:
```bash
# Basic task with defaults
$ todo add "Buy groceries"
Task 1 created: Buy groceries (Priority: medium)

# With priority
$ todo add "Urgent report" --priority high
Task 2 created: Urgent report (Priority: high)

# With tags
$ todo add "Team meeting" --tag work --tag recurring
Task 3 created: Team meeting (Priority: medium, Tags: work, recurring)

# Full options
$ todo add "Vacation planning" -d "Book flights and hotels" -p low -t personal -t travel
Task 4 created: Vacation planning (Priority: low, Tags: personal, travel)
```

---

### 2. update (Extended)

Update an existing task's fields including priority and tags.

**Signature**:
```
todo update <id> [--title TEXT] [--description TEXT] [--priority LEVEL] [--tag TAG]...
```

**Arguments**:
| Argument | Type | Required | Description |
|----------|------|----------|-------------|
| id | integer | Yes | Task ID to update |

**Options**:
| Option | Type | Description |
|--------|------|-------------|
| --title | string | New title (1-200 characters) |
| --description | string | New description (0-1000 characters) |
| --priority, -p | choice | New priority: high, medium, low |
| --tag, -t | string (multiple) | Replace all tags (can be repeated) |

**Note**: At least one option must be provided. Tags are replaced entirely (not appended).

**Output** (success):
```
Task <id> updated.
```

**Exit Codes**:
| Code | Condition |
|------|-----------|
| 0 | Success |
| 1 | Task not found, validation error, or no options provided |

**Examples**:
```bash
# Update priority only
$ todo update 1 --priority high
Task 1 updated.

# Update tags (replaces all existing)
$ todo update 1 --tag work --tag urgent
Task 1 updated.

# Update multiple fields
$ todo update 1 --title "New title" --priority low --tag home
Task 1 updated.
```

---

### 3. search (New)

Search tasks by keyword in title and description.

**Signature**:
```
todo search <keyword>
```

**Arguments**:
| Argument | Type | Required | Description |
|----------|------|----------|-------------|
| keyword | string | Yes | Search term (case-insensitive, substring match) |

**Output** (matches found):
```
ID  Status  Priority  Title                     Tags          Created
--  ------  --------  -----                     ----          -------
1   [ ]     high      Finish quarterly report   work, urgent  2026-01-17
3   [ ]     medium    Team standup              work          2026-01-17
```

**Output** (no matches):
```
No tasks found matching '<keyword>'.
```

**Exit Codes**:
| Code | Condition |
|------|-----------|
| 0 | Success (even if no results) |
| 1 | Empty search term |

**Examples**:
```bash
# Search by title
$ todo search "report"
ID  Status  Priority  Title                     Tags          Created
--  ------  --------  -----                     ----          -------
1   [ ]     high      Finish quarterly report   work, urgent  2026-01-17

# Search by description content
$ todo search "flights"
ID  Status  Priority  Title              Tags             Created
--  ------  --------  -----              ----             -------
4   [ ]     low       Vacation planning  personal, travel 2026-01-17

# Case-insensitive
$ todo search "MEETING"
ID  Status  Priority  Title          Tags            Created
--  ------  --------  -----          ----            -------
3   [ ]     medium    Team meeting   work, recurring 2026-01-17

# No matches
$ todo search "nonexistent"
No tasks found matching 'nonexistent'.
```

---

### 4. list (Extended)

List tasks with optional filters and sorting.

**Signature**:
```
todo list [--status STATUS] [--priority LEVEL]... [--tag TAG]... [--sort FIELD] [--order ORDER]
```

**Options**:
| Option | Type | Default | Description |
|--------|------|---------|-------------|
| --status, -s | choice | None | Filter by: pending, completed |
| --priority, -p | choice (multiple) | None | Filter by: high, medium, low (OR logic) |
| --tag, -t | string (multiple) | None | Filter by tag (OR logic) |
| --sort | choice | created | Sort by: priority, title, created |
| --order, -o | choice | asc | Sort order: asc, desc |

**Filter Logic**:
- Multiple `--priority` values: OR (show high OR medium)
- Multiple `--tag` values: OR (show work OR home)
- Different filter types: AND (show high priority AND work tag)

**Output** (tasks found):
```
ID  Status  Priority  Title                     Tags          Created
--  ------  --------  -----                     ----          -------
1   [ ]     high      Finish quarterly report   work, urgent  2026-01-17
2   [x]     medium    Call mom                  home          2026-01-17
3   [ ]     low       Buy groceries             home          2026-01-17
```

**Output** (no tasks):
```
No tasks found.
```

**Output** (no matching filter):
```
No tasks found matching your criteria.
```

**Exit Codes**:
| Code | Condition |
|------|-----------|
| 0 | Success |
| 1 | Invalid filter value |

**Examples**:
```bash
# List all (default sort by created)
$ todo list

# Filter by status
$ todo list --status pending
$ todo list --status completed

# Filter by priority (single)
$ todo list --priority high

# Filter by priority (multiple = OR)
$ todo list --priority high --priority medium

# Filter by tag
$ todo list --tag work
$ todo list --tag work --tag urgent

# Combined filters (AND between types)
$ todo list --status pending --priority high --tag work

# Sort by priority
$ todo list --sort priority

# Sort descending
$ todo list --sort title --order desc

# Full example
$ todo list --status pending --tag work --sort priority --order asc
```

---

## Error Messages

| Scenario | Message | Exit Code |
|----------|---------|-----------|
| Invalid priority value | "Invalid priority. Use: high, medium, or low" | 1 |
| Empty tag | "Tag cannot be empty" | 1 |
| Invalid tag characters | "Invalid tag. Use alphanumeric characters and hyphens only." | 1 |
| Tag too long | "Tag must be 50 characters or less" | 1 |
| Task not found | "Error: Task not found: <id>" | 1 |
| Empty search term | "Search term is required" | 1 |
| No update options | "Error: No updates provided. Use --title, --description, --priority, or --tag." | 1 |

---

## Output Format

### Table Format

All list/search output uses fixed-width table format:

| Column | Width | Alignment |
|--------|-------|-----------|
| ID | 4 | Right |
| Status | 6 | Center |
| Priority | 8 | Left |
| Title | 25 (truncate with ...) | Left |
| Tags | 14 (truncate with ...) | Left |
| Created | 10 | Left |

### Status Indicators

| Status | Indicator |
|--------|-----------|
| Pending | `[ ]` |
| Completed | `[x]` |

### Date Format

- Format: `YYYY-MM-DD`
- Example: `2026-01-17`

---

## Backwards Compatibility

All existing task-crud commands remain unchanged:

| Command | Status |
|---------|--------|
| `todo add <title>` | Extended (new options) |
| `todo list` | Extended (new options) |
| `todo update <id>` | Extended (new options) |
| `todo delete <id>` | Unchanged |
| `todo complete <id>` | Unchanged |

Existing CLI invocations without new options work identically to before.

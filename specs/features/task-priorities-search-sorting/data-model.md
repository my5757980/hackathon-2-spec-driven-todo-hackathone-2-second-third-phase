# Data Model: Task Priorities, Search, and Sorting

**Feature**: task-priorities-search-sorting
**Date**: 2026-01-17
**Spec Reference**: @specs/features/task-priorities-search-sorting/spec.md

## Overview

This document defines the extended data model for the task-priorities-search-sorting feature. It builds on the existing Task entity from task-crud, adding priority and tags fields.

---

## Entities

### Priority (Enum)

Represents the importance level of a task.

| Member | Value | Display | Sort Order |
|--------|-------|---------|------------|
| HIGH | 1 | "high" | First (ascending) |
| MEDIUM | 2 | "medium" | Second |
| LOW | 3 | "low" | Last |

**Notes**:
- IntEnum allows natural sorting by numeric value
- String display for CLI output
- Default for new tasks: MEDIUM

---

### Task (Extended)

Extended from task-crud with priority and tags fields.

| Field | Type | Required | Default | Constraints | Description |
|-------|------|----------|---------|-------------|-------------|
| id | int | Yes | Auto-increment | Unique, ≥1 | Unique task identifier |
| title | str | Yes | - | 1-200 chars | Task title |
| description | str | No | None | 0-1000 chars | Optional task details |
| completed | bool | Yes | False | - | Completion status |
| created_at | datetime | Yes | Now | - | Creation timestamp |
| **priority** | Priority | Yes | MEDIUM | HIGH\|MEDIUM\|LOW | Task importance level |
| **tags** | list[str] | Yes | [] | Each tag: 1-50 chars, alphanumeric + hyphen | Categorization labels |

**New Fields** (highlighted in bold):
- `priority`: Added for task prioritization
- `tags`: Added for flexible categorization

---

## Validation Rules

### Priority Validation

| Rule | Constraint | Error Message |
|------|------------|---------------|
| Valid value | Must be "high", "medium", or "low" (case-insensitive) | "Invalid priority. Use: high, medium, or low" |

### Tag Validation

| Rule | Constraint | Error Message |
|------|------------|---------------|
| Not empty | Tag string must have length ≥1 | "Tag cannot be empty" |
| Max length | Tag string must have length ≤50 | "Tag must be 50 characters or less" |
| Valid characters | Only alphanumeric (a-z, A-Z, 0-9) and hyphens (-) | "Invalid tag. Use alphanumeric characters and hyphens only." |
| No leading hyphen | Must start with alphanumeric | "Tag must start with a letter or number" |

### Normalization

| Field | Normalization | Example |
|-------|---------------|---------|
| priority | Lowercase input, map to Enum | "HIGH" → Priority.HIGH |
| tags | Lowercase, trim whitespace | " Work " → "work" |

---

## State Transitions

### Task Lifecycle (unchanged from task-crud)

```
┌─────────┐    add     ┌─────────┐
│ (none)  │ ─────────► │ pending │
└─────────┘            └────┬────┘
                            │
                  complete  │ complete
                    ▼       │
              ┌──────────┐  │
              │completed │◄─┘
              └────┬─────┘
                   │ complete (toggle)
                   ▼
              ┌─────────┐
              │ pending │
              └─────────┘
```

### Priority State (new)

- Initial: MEDIUM (on task creation without --priority)
- Transition: Any priority to any other via `update --priority`
- No constraints on transitions

### Tags State (new)

- Initial: Empty list (on task creation without --tag)
- Add: Via `add --tag` or `update --tag`
- Replace: `update --tag` replaces all existing tags
- Clear: `update --tag ""` is an error (empty tag invalid)
- Note: To clear all tags, future enhancement may add `--clear-tags`

---

## Relationships

```
┌─────────────┐
│    Task     │
├─────────────┤
│ id          │
│ title       │
│ description │
│ completed   │
│ created_at  │
│ priority ───┼───────► Priority (Enum)
│ tags ───────┼───────► list[str] (0..N tags)
└─────────────┘
```

**Cardinality**:
- Task → Priority: Many-to-One (each task has exactly one priority)
- Task → Tags: One-to-Many (each task can have 0 or more tags)

---

## Indexes / Query Optimization

For Phase 1 (in-memory), no indexes needed. Document for Phase 2+ planning:

| Query Pattern | Suggested Index (Phase 2+) |
|---------------|---------------------------|
| Filter by status | `completed` column |
| Filter by priority | `priority` column |
| Filter by tag | Tags array (GIN index for PostgreSQL) |
| Sort by created | `created_at` (default ordering) |
| Search by keyword | Full-text index on title + description |

---

## Example Data

```python
# Example Task instances
task1 = Task(
    id=1,
    title="Finish quarterly report",
    description="Q4 financial summary for stakeholders",
    completed=False,
    created_at=datetime(2026, 1, 17, 9, 0, 0),
    priority=Priority.HIGH,
    tags=["work", "urgent"]
)

task2 = Task(
    id=2,
    title="Buy groceries",
    description=None,
    completed=False,
    created_at=datetime(2026, 1, 17, 10, 30, 0),
    priority=Priority.LOW,
    tags=["home"]
)

task3 = Task(
    id=3,
    title="Team standup",
    description="Daily sync with engineering team",
    completed=False,
    created_at=datetime(2026, 1, 17, 11, 0, 0),
    priority=Priority.MEDIUM,  # default
    tags=["work"]
)
```

---

## Migration Notes

### From task-crud

Existing Task model needs two new fields:

1. **priority**: Add with default `Priority.MEDIUM`
2. **tags**: Add with default `[]`

No data migration needed (in-memory storage is ephemeral).

### For Phase 2+

When moving to PostgreSQL:

```sql
-- Add columns to tasks table
ALTER TABLE tasks ADD COLUMN priority VARCHAR(10) DEFAULT 'medium';
ALTER TABLE tasks ADD COLUMN tags TEXT[] DEFAULT '{}';

-- Add check constraint for priority
ALTER TABLE tasks ADD CONSTRAINT valid_priority
  CHECK (priority IN ('high', 'medium', 'low'));
```

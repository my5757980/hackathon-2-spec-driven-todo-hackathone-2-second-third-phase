# Quickstart: Task Priorities, Search, and Sorting

**Feature**: task-priorities-search-sorting
**Date**: 2026-01-17
**Prerequisite**: task-crud feature must be implemented first

## Overview

This guide walks through the new priority, tag, search, filter, and sort features added to the Todo CLI.

---

## Prerequisites

- Python 3.13+
- Todo CLI installed (`pip install -e .` from project root)
- task-crud feature working

Verify setup:
```bash
$ todo --help
# Should show add, list, update, delete, complete, search commands
```

---

## Quick Examples

### 1. Create Tasks with Priorities

```bash
# High priority task
$ todo add "Finish quarterly report" --priority high --tag work --tag urgent
Task 1 created: Finish quarterly report (Priority: high, Tags: work, urgent)

# Default priority (medium)
$ todo add "Team standup" --tag work
Task 2 created: Team standup (Priority: medium, Tags: work)

# Low priority
$ todo add "Buy groceries" --priority low --tag home
Task 3 created: Buy groceries (Priority: low, Tags: home)
```

### 2. Search for Tasks

```bash
# Search by keyword
$ todo search "report"
ID  Status  Priority  Title                     Tags          Created
--  ------  --------  -----                     ----          -------
1   [ ]     high      Finish quarterly report   work, urgent  2026-01-17

# Case-insensitive search
$ todo search "STANDUP"
ID  Status  Priority  Title          Tags  Created
--  ------  --------  -----          ----  -------
2   [ ]     medium    Team standup   work  2026-01-17
```

### 3. Filter Tasks

```bash
# By priority
$ todo list --priority high
ID  Status  Priority  Title                     Tags          Created
--  ------  --------  -----                     ----          -------
1   [ ]     high      Finish quarterly report   work, urgent  2026-01-17

# By tag
$ todo list --tag work
ID  Status  Priority  Title                     Tags          Created
--  ------  --------  -----                     ----          -------
1   [ ]     high      Finish quarterly report   work, urgent  2026-01-17
2   [ ]     medium    Team standup              work          2026-01-17

# By status
$ todo list --status pending

# Combine filters
$ todo list --priority high --tag work --status pending
```

### 4. Sort Tasks

```bash
# Sort by priority (high first)
$ todo list --sort priority

# Sort by title (A-Z)
$ todo list --sort title

# Sort by creation date (oldest first)
$ todo list --sort created

# Reverse order
$ todo list --sort priority --order desc
```

### 5. Update Priority and Tags

```bash
# Change priority
$ todo update 1 --priority medium
Task 1 updated.

# Replace all tags
$ todo update 1 --tag personal --tag hobby
Task 1 updated.
```

---

## Common Workflows

### Morning Planning

```bash
# See all high-priority pending tasks
$ todo list --status pending --priority high --sort created

# See all work tasks for today
$ todo list --tag work --status pending --sort priority
```

### End of Day Review

```bash
# See what was completed
$ todo list --status completed

# See remaining high-priority items
$ todo list --status pending --priority high
```

### Project-Specific View

```bash
# Filter by project tag
$ todo list --tag project-alpha --sort priority

# Search for specific topic
$ todo search "deployment"
```

---

## Priority Levels

| Level | Use Case |
|-------|----------|
| high | Urgent, time-sensitive, blocking |
| medium | Normal priority (default) |
| low | Nice-to-have, can wait |

---

## Tag Best Practices

1. **Use lowercase**: Tags are case-insensitive (`Work` = `work`)
2. **Keep it simple**: Use hyphens for multi-word tags (`home-improvement`)
3. **Common tags**:
   - Context: `work`, `home`, `personal`
   - Status: `urgent`, `waiting`, `someday`
   - Project: `project-name`, `client-x`

---

## Troubleshooting

### "Invalid priority"
Use only: `high`, `medium`, or `low`

```bash
# Wrong
$ todo add "Task" --priority urgent
Invalid priority. Use: high, medium, or low

# Correct
$ todo add "Task" --priority high
```

### "Tag cannot be empty"
Provide a non-empty tag value:

```bash
# Wrong
$ todo add "Task" --tag ""
Tag cannot be empty

# Correct
$ todo add "Task" --tag work
```

### "No tasks found matching"
Your filter combination returned no results. Try:
- Remove some filters
- Check for typos in tag names
- Use `todo list` to see all tasks first

---

## Next Steps

- Run `/sp.tasks` to generate implementation tasks
- Implement the feature via `/sp.implement`
- Test with the manual checklist in `tests/manual/phase1-checklist.md`

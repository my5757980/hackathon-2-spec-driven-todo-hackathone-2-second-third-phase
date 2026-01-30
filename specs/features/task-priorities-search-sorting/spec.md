# Feature Specification: Task Priorities, Search, and Sorting

**Feature Branch**: `002-task-priorities-search-sorting`
**Created**: 2026-01-17
**Status**: Draft
**Input**: User description: "Implement intermediate usability features: priorities/tags for categorization, search/filter for quick access, and sort for custom ordering"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Assign Priority to Task (Priority: P1)

As a user, I want to assign a priority level (high, medium, low) to my tasks so that I can focus on the most important items first.

**Why this priority**: Priority assignment is the foundational feature that enables task categorization. Without priorities, sorting by priority and filtering by priority are not possible. This is the most critical capability.

**Independent Test**: Can be fully tested by creating a task with `--priority high`, viewing it with `list`, and verifying the priority displays correctly. Delivers immediate value by allowing users to mark what matters most.

**Acceptance Scenarios**:

1. **Given** no tasks exist, **When** user runs `add "Urgent report" --priority high`, **Then** task is created with priority "high" and success message shows "Task 1 created: Urgent report (Priority: high)"
2. **Given** a task exists with ID 1, **When** user runs `update 1 --priority medium`, **Then** task priority is updated and confirmation shows "Task 1 updated."
3. **Given** no priority specified, **When** user runs `add "Regular task"`, **Then** task is created with default priority "medium"

---

### User Story 2 - Assign Tags to Task (Priority: P1)

As a user, I want to assign one or more tags (e.g., work, home, personal) to my tasks so that I can categorize and organize them by context.

**Why this priority**: Tags provide flexible categorization alongside priorities. Users need both dimensions to effectively organize tasks. Core feature for usability.

**Independent Test**: Can be fully tested by creating a task with `--tag work --tag urgent`, viewing it with `list`, and verifying tags display correctly.

**Acceptance Scenarios**:

1. **Given** no tasks exist, **When** user runs `add "Team meeting" --tag work`, **Then** task is created with tag "work" and success message shows "Task 1 created: Team meeting (Tags: work)"
2. **Given** no tasks exist, **When** user runs `add "Grocery run" --tag home --tag errands`, **Then** task is created with both tags and success message shows "Task 1 created: Grocery run (Tags: home, errands)"
3. **Given** a task exists with ID 1 and tag "work", **When** user runs `update 1 --tag personal`, **Then** task tags are replaced with "personal" and confirmation shows "Task 1 updated."

---

### User Story 3 - Search Tasks by Keyword (Priority: P2)

As a user, I want to search my tasks by keyword so that I can quickly find specific tasks without scrolling through the entire list.

**Why this priority**: Search is essential for users with many tasks. It provides quick access to specific items, but requires tasks to exist first (depends on P1 features being useful).

**Independent Test**: Can be fully tested by creating several tasks, running `search "meeting"`, and verifying only matching tasks appear.

**Acceptance Scenarios**:

1. **Given** tasks with titles "Team meeting" and "Buy groceries" exist, **When** user runs `search "meeting"`, **Then** only "Team meeting" is displayed
2. **Given** a task with description "Call John about project" exists, **When** user runs `search "John"`, **Then** that task is returned (search includes descriptions)
3. **Given** no tasks match keyword, **When** user runs `search "vacation"`, **Then** message shows "No tasks found matching 'vacation'."
4. **Given** search term is case-insensitive, **When** user runs `search "MEETING"`, **Then** task with title "Team meeting" is returned

---

### User Story 4 - Filter Tasks by Status (Priority: P2)

As a user, I want to filter my task list by completion status so that I can focus on pending items or review completed work.

**Why this priority**: Filtering by status is a fundamental organization feature that helps users focus on what needs to be done versus what's already complete.

**Independent Test**: Can be fully tested by having completed and pending tasks, running `list --status pending`, and verifying only pending tasks appear.

**Acceptance Scenarios**:

1. **Given** tasks with mixed completion status exist, **When** user runs `list --status pending`, **Then** only incomplete tasks are displayed
2. **Given** tasks with mixed completion status exist, **When** user runs `list --status completed`, **Then** only completed tasks are displayed
3. **Given** no pending tasks exist, **When** user runs `list --status pending`, **Then** message shows "No pending tasks found."

---

### User Story 5 - Filter Tasks by Priority (Priority: P2)

As a user, I want to filter my task list by priority level so that I can focus on high-priority items when I have limited time.

**Why this priority**: Filtering by priority complements priority assignment, allowing users to view only urgent items. Essential for effective task management.

**Independent Test**: Can be fully tested by having tasks with different priorities, running `list --priority high`, and verifying only high-priority tasks appear.

**Acceptance Scenarios**:

1. **Given** tasks with high, medium, and low priorities exist, **When** user runs `list --priority high`, **Then** only high-priority tasks are displayed
2. **Given** no high-priority tasks exist, **When** user runs `list --priority high`, **Then** message shows "No high-priority tasks found."
3. **Given** tasks exist, **When** user runs `list --priority medium --priority low`, **Then** tasks with medium OR low priority are displayed

---

### User Story 6 - Filter Tasks by Tag (Priority: P2)

As a user, I want to filter my task list by tag so that I can see all tasks related to a specific context (e.g., all "work" tasks).

**Why this priority**: Tag filtering enables context-based viewing, allowing users to focus on one area of their life or work at a time.

**Independent Test**: Can be fully tested by having tasks with different tags, running `list --tag work`, and verifying only work-tagged tasks appear.

**Acceptance Scenarios**:

1. **Given** tasks with tags "work" and "home" exist, **When** user runs `list --tag work`, **Then** only tasks tagged "work" are displayed
2. **Given** tasks exist, **When** user runs `list --tag work --tag urgent`, **Then** tasks with "work" OR "urgent" tag are displayed
3. **Given** no tasks have tag "vacation", **When** user runs `list --tag vacation`, **Then** message shows "No tasks found with tag 'vacation'."

---

### User Story 7 - Sort Tasks (Priority: P3)

As a user, I want to sort my task list by different criteria (priority, alphabetically, creation date) so that I can view tasks in an order that makes sense for my workflow.

**Why this priority**: Sorting enhances the list view but is not essential for basic task management. Users can manage tasks without custom sorting.

**Independent Test**: Can be fully tested by having multiple tasks, running `list --sort priority`, and verifying tasks appear in priority order.

**Acceptance Scenarios**:

1. **Given** tasks with different priorities exist, **When** user runs `list --sort priority`, **Then** tasks are displayed in order: high, medium, low
2. **Given** tasks exist, **When** user runs `list --sort title`, **Then** tasks are displayed in alphabetical order by title
3. **Given** tasks exist, **When** user runs `list --sort created`, **Then** tasks are displayed in order of creation (oldest first)
4. **Given** tasks exist, **When** user runs `list --sort priority --order desc`, **Then** tasks are displayed in reverse priority order: low, medium, high
5. **Given** no sort specified, **When** user runs `list`, **Then** tasks are displayed in order of creation (default)

---

### User Story 8 - Combine Filters and Sort (Priority: P3)

As a user, I want to combine multiple filters and sorting options so that I can get a highly customized view of my tasks.

**Why this priority**: Combination of features is powerful but relies on all individual features working first. This is an advanced use case.

**Independent Test**: Can be fully tested by running `list --status pending --priority high --sort title` and verifying the filtered, sorted results.

**Acceptance Scenarios**:

1. **Given** various tasks exist, **When** user runs `list --status pending --priority high`, **Then** only pending high-priority tasks are displayed
2. **Given** various tasks exist, **When** user runs `list --tag work --sort priority`, **Then** work-tagged tasks are displayed sorted by priority
3. **Given** various tasks exist, **When** user runs `list --status pending --tag work --sort title --order desc`, **Then** pending work tasks are displayed sorted by title in descending order

---

### Edge Cases

- What happens when user provides invalid priority value (e.g., `--priority urgent`)? → Error message: "Invalid priority. Use: high, medium, or low"
- What happens when user provides empty tag (e.g., `--tag ""`)? → Error message: "Tag cannot be empty"
- What happens when filtering returns no results? → Appropriate message like "No tasks found matching your criteria."
- What happens when search term is empty? → Error message: "Search term is required"
- What happens when combining conflicting filters (e.g., `--status pending --status completed`)? → Return tasks matching ANY status (OR logic)
- What happens when tag contains special characters? → Tags limited to alphanumeric characters and hyphens; error for invalid characters

## Requirements *(mandatory)*

### Functional Requirements

#### Priority Management
- **FR-001**: System MUST allow users to assign a priority level (high, medium, low) when creating a task via `--priority <level>` option
- **FR-002**: System MUST default new tasks to "medium" priority when no priority is specified
- **FR-003**: System MUST allow users to update a task's priority via `update <id> --priority <level>`
- **FR-004**: System MUST display task priority in the list view
- **FR-005**: System MUST reject invalid priority values with a clear error message

#### Tag Management
- **FR-006**: System MUST allow users to assign one or more tags when creating a task via `--tag <name>` option (repeatable)
- **FR-007**: System MUST allow users to update a task's tags via `update <id> --tag <name>` (replaces existing tags)
- **FR-008**: System MUST display task tags in the list view
- **FR-009**: System MUST validate tags: alphanumeric characters and hyphens only, 1-50 characters
- **FR-010**: System MUST allow tasks to have zero tags (tags are optional)

#### Search
- **FR-011**: System MUST provide a `search <keyword>` command to find tasks
- **FR-012**: System MUST search both title and description fields
- **FR-013**: System MUST perform case-insensitive keyword matching
- **FR-014**: System MUST use simple substring matching (not full-text search)
- **FR-015**: System MUST display helpful message when no results match

#### Filtering
- **FR-016**: System MUST support filtering by status via `list --status <pending|completed>`
- **FR-017**: System MUST support filtering by priority via `list --priority <high|medium|low>`
- **FR-018**: System MUST support filtering by tag via `list --tag <name>`
- **FR-019**: System MUST support multiple values for the same filter type (OR logic)
- **FR-020**: System MUST support combining different filter types (AND logic between types)

#### Sorting
- **FR-021**: System MUST support sorting via `list --sort <field>` where field is: priority, title, created
- **FR-022**: System MUST support sort order via `--order <asc|desc>` with "asc" as default
- **FR-023**: System MUST default to sorting by creation date (ascending) when no sort specified
- **FR-024**: Priority sort order MUST be: high (first) → medium → low (last) for ascending

#### Integration
- **FR-025**: System MUST preserve all existing task-crud functionality without breaking changes
- **FR-026**: System MUST extend the Task entity to include priority and tags fields
- **FR-027**: System MUST complete all filter/search/sort operations within 500ms for lists up to 1000 tasks

### Key Entities

- **Task** (extended from task-crud):
  - All existing fields (id, title, description, completed, created_at)
  - **priority**: Categorization level (high, medium, low) - defaults to medium
  - **tags**: List of user-defined labels for flexible categorization - defaults to empty list

- **Priority Levels**:
  - Three fixed levels: high, medium, low
  - Used for filtering and sorting tasks by importance

- **Tags**:
  - User-defined labels for flexible categorization
  - Alphanumeric characters and hyphens, 1-50 characters each
  - A task can have zero or more tags

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can assign and update priorities on tasks in a single command
- **SC-002**: Users can assign and update tags on tasks in a single command
- **SC-003**: Search returns matching tasks within 500ms for lists up to 1000 tasks
- **SC-004**: Users can filter tasks by any combination of status, priority, and tag
- **SC-005**: Users can sort task lists by priority, title, or creation date in ascending or descending order
- **SC-006**: 100% of existing task-crud tests continue to pass after integration
- **SC-007**: All invalid inputs (bad priority, empty tag, empty search) return clear, actionable error messages
- **SC-008**: Users can find a specific task among 100 tasks in under 10 seconds using search or filters

## Assumptions

- Tags are case-insensitive for filtering purposes ("Work" and "work" are treated as the same tag)
- Multiple `--tag` flags on create/update will add all specified tags (not replace one at a time)
- When updating tags, the new tags replace all existing tags (not append)
- Priority sort considers "high" as highest value (appears first in ascending order)
- Search uses simple substring matching, not fuzzy matching or stemming
- This feature builds on top of the task-crud feature; task-crud must be implemented first

## Constraints

- **Phase 1**: In-memory storage only; no persistence between CLI sessions
- **Framework**: Click for CLI commands (consistent with task-crud)
- **Runtime**: Python 3.13+
- **No external libraries**: Use Python built-ins for search and sort
- **Performance**: All operations must complete within 500ms
- **Concurrency**: Single-user, single-threaded operation

## Out of Scope

- Full-text search engine (Elasticsearch, etc.) - using simple keyword matching
- ML-based smart prioritization - using user-assigned levels only
- UI visualizations (charts, graphs) - list views only
- Calendar integration for reminders - separate feature
- Tag hierarchies or nested tags - flat tag structure only
- Saved filters or filter presets - users must specify filters each time
- Due date filtering - will be part of a separate feature (task-recurring-Due-Dates-and-reminders)

## CLI Commands Summary

| Command                                                    | Description                                       |
|------------------------------------------------------------|---------------------------------------------------|
| `add <title> [--description] [--priority] [--tag]...`      | Create task with optional priority and tags       |
| `update <id> [--title] [--description] [--priority] [--tag]...` | Update task fields including priority and tags |
| `search <keyword>`                                         | Find tasks by keyword in title/description        |
| `list [--status] [--priority] [--tag] [--sort] [--order]`  | List tasks with optional filters and sorting      |

## Example Usage

```
# Create tasks with priorities and tags
$ todo add "Finish quarterly report" --priority high --tag work --tag urgent
Task 1 created: Finish quarterly report (Priority: high, Tags: work, urgent)

$ todo add "Buy groceries" --priority low --tag home
Task 2 created: Buy groceries (Priority: low, Tags: home)

$ todo add "Team standup" --tag work
Task 3 created: Team standup (Priority: medium, Tags: work)

# Search for tasks
$ todo search "report"
ID  Status  Priority  Title                     Tags          Created
--  ------  --------  -----                     ----          -------
1   [ ]     high      Finish quarterly report   work, urgent  2026-01-17

# Filter tasks
$ todo list --priority high
ID  Status  Priority  Title                     Tags          Created
--  ------  --------  -----                     ----          -------
1   [ ]     high      Finish quarterly report   work, urgent  2026-01-17

$ todo list --tag work
ID  Status  Priority  Title                     Tags          Created
--  ------  --------  -----                     ----          -------
1   [ ]     high      Finish quarterly report   work, urgent  2026-01-17
3   [ ]     medium    Team standup              work          2026-01-17

# Sort tasks
$ todo list --sort priority
ID  Status  Priority  Title                     Tags          Created
--  ------  --------  -----                     ----          -------
1   [ ]     high      Finish quarterly report   work, urgent  2026-01-17
3   [ ]     medium    Team standup              work          2026-01-17
2   [ ]     low       Buy groceries             home          2026-01-17

# Combine filters and sort
$ todo list --tag work --status pending --sort title
ID  Status  Priority  Title                     Tags          Created
--  ------  --------  -----                     ----          -------
1   [ ]     high      Finish quarterly report   work, urgent  2026-01-17
3   [ ]     medium    Team standup              work          2026-01-17
```

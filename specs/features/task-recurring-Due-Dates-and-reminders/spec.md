# Feature: Task Recurring & Due Dates Reminders

**Feature Branch**: `003-task-recurring-due-dates-reminders`
**Created**: 2026-01-17
**Status**: Draft
**Phase**: 1 (CLI) → 2 (Web) → 3 (Chatbot)

## User Stories

### Recurring Tasks

- As a user, I want to create recurring tasks (daily, weekly, monthly) so that I don't have to manually recreate repetitive tasks.
- As a user, I want the system to automatically create the next instance of a recurring task when I complete the current one so that my schedule stays up to date.
- As a user, I want to stop a recurring task from repeating so that I can end a recurring commitment.
- As a user, I want to modify the recurrence pattern of an existing task so that I can adjust my schedule.

### Due Dates & Reminders

- As a user, I want to assign a due date and time to my tasks so that I can track deadlines.
- As a user, I want to receive a reminder notification before a task is due so that I don't miss deadlines.
- As a user, I want to set how far in advance I receive reminders so that I have enough time to prepare.
- As a user, I want to view tasks sorted by due date so that I can see what's coming up.
- As a user, I want to filter tasks by due date range so that I can focus on today's or this week's tasks.

### Chatbot Integration (Phase 3)

- As a user, I want to create recurring tasks using natural language (e.g., "Add weekly team meeting every Monday at 10 AM") so that task entry feels conversational.
- As a user, I want to set due dates with natural language (e.g., "Remind me to call mom tomorrow at 5 PM") so that I can quickly add deadlines.

---

## Acceptance Criteria

### Recurring Tasks

#### Create Recurring Task

- User can specify recurrence when creating a task via `--recurring <interval>` option
- Supported intervals: `daily`, `weekly`, `monthly`
- Recurring tasks display a recurrence indicator in the list view
- Success message includes recurrence: "Task 1 created: Weekly meeting (Recurring: weekly)"

**Command (Phase 1 CLI)**:
```
todo add "Weekly meeting" --recurring weekly
```

**Error Cases**:
- Invalid interval → "Invalid recurrence. Use: daily, weekly, or monthly"

---

#### Auto-Reschedule on Completion

- When a recurring task is marked complete, system automatically creates the next instance
- Next instance has:
  - Same title, description, priority, and tags
  - Due date advanced by the recurrence interval (if due date was set)
  - New unique ID
  - Status: pending
- Original completed task remains in history with completed status
- User sees confirmation: "Task 1 completed. Next occurrence (Task 2) created for [date]."

**Example Flow**:
```
$ todo complete 1
Task 1 completed. Next occurrence (Task 2) created for 2026-01-24.
```

---

#### Stop Recurrence

- User can remove recurrence from a task via `--recurring none`
- Stopping recurrence does not delete the current task instance
- Confirmation: "Task 1 recurrence stopped. This is now a one-time task."

**Command**:
```
todo update 1 --recurring none
```

---

#### Modify Recurrence

- User can change recurrence interval via `update --recurring <new-interval>`
- Change takes effect starting from the next occurrence
- Confirmation: "Task 1 recurrence changed to monthly."

---

### Due Dates & Reminders

#### Set Due Date

- User can assign due date when creating or updating a task via `--due <datetime>`
- Accepted formats: `YYYY-MM-DD`, `YYYY-MM-DD HH:MM`, or natural language (Phase 3)
- Due date displayed in task list
- Overdue tasks highlighted or marked with indicator

**Command (Phase 1 CLI)**:
```
todo add "Submit report" --due 2026-01-20
todo add "Call client" --due "2026-01-20 14:30"
todo update 1 --due 2026-01-25
```

**Error Cases**:
- Invalid date format → "Invalid date. Use: YYYY-MM-DD or YYYY-MM-DD HH:MM"
- Past date → Warning: "Note: Due date is in the past"

---

#### Set Reminder

- User can set reminder offset via `--remind <offset>` when due date exists
- Supported offsets: `15m`, `30m`, `1h`, `2h`, `1d`, `1w` (minutes, hours, days, weeks)
- Default reminder: 1 hour before due time (if not specified)
- Reminders trigger browser notifications (Phase 2+)

**Command**:
```
todo add "Meeting prep" --due "2026-01-20 10:00" --remind 1h
```

**Reminder Behavior**:
- Phase 1 (CLI): Display upcoming reminders when running `todo list --reminders`
- Phase 2+ (Web): Browser push notifications at reminder time

**Error Cases**:
- Reminder without due date → "Cannot set reminder without a due date"
- Invalid offset format → "Invalid reminder. Use: 15m, 30m, 1h, 2h, 1d, or 1w"

---

#### View and Filter by Due Date

- `list --due today` shows tasks due today
- `list --due week` shows tasks due this week
- `list --due overdue` shows past-due incomplete tasks
- `list --sort due` sorts by due date (earliest first)

**Examples**:
```
$ todo list --due today
ID  Status  Priority  Title           Due         Recurring
--  ------  --------  -----           ---         ---------
3   [ ]     high      Submit report   2026-01-17  -
5   [ ]     medium    Call client     2026-01-17  -

$ todo list --due overdue
ID  Status  Priority  Title           Due         Recurring
--  ------  --------  -----           ---         ---------
1   [ ]     high      Old task        2026-01-10  -
```

---

### Chatbot Natural Language (Phase 3)

#### Natural Language Recurring

- Chatbot understands: "Add daily standup at 9 AM"
- Extracts: title="daily standup", recurring=daily, due_time=09:00
- Confirms: "I've created 'daily standup' as a daily recurring task at 9:00 AM."

#### Natural Language Due Dates

- Chatbot understands: "Remind me to call mom tomorrow at 5 PM"
- Extracts: title="call mom", due_date=tomorrow, due_time=17:00, remind=default
- Confirms: "I've set a reminder to 'call mom' for tomorrow at 5:00 PM."

---

## Edge Cases

- What happens when completing a recurring task with no due date? → Next instance created immediately, no date advancement
- What happens when due date is today and time has passed? → Task marked as overdue, still completable
- What happens when reminder time has already passed? → No notification sent, task shown in "missed reminders" list
- What happens when user sets reminder further than due date? → Error: "Reminder cannot be after due date"
- What happens when recurring task has due date "2026-01-31" and interval is monthly? → Next due date is "2026-02-28" (end of month handling)
- What happens when browser notifications are blocked? → Fallback to in-app banner notification (Phase 2+)

---

## Constraints

- **Phase 1 (CLI)**: In-memory only; reminders displayed on next `list` command; no real-time notifications
- **Phase 2+ (Web)**: Persist in database; browser notifications require user permission
- **Recurrence**: Fixed intervals only (daily, weekly, monthly); no custom patterns
- **Reminders**: Browser notifications only; no email/SMS
- **Time handling**: User's local timezone; no timezone conversion

---

## Data Model

### Task Entity (Extended)

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| id | int | Yes | Auto | Unique identifier |
| title | str | Yes | - | Task title |
| description | str | No | None | Task details |
| completed | bool | Yes | False | Completion status |
| created_at | datetime | Yes | Now | Creation timestamp |
| priority | Priority | Yes | MEDIUM | Importance level |
| tags | list[str] | Yes | [] | Categorization labels |
| **due_date** | datetime | No | None | When task is due |
| **recurring_interval** | RecurringInterval | No | None | Recurrence pattern |
| **reminder_offset** | str | No | "1h" | How far before due to remind |
| **parent_task_id** | int | No | None | ID of original recurring task (for tracking) |

### RecurringInterval Enum

| Value | Description |
|-------|-------------|
| NONE | No recurrence (one-time task) |
| DAILY | Repeats every day |
| WEEKLY | Repeats every 7 days |
| MONTHLY | Repeats every month (same day of month) |

---

## CLI Commands Summary

| Command | Description |
|---------|-------------|
| `add <title> [--due] [--recurring] [--remind]` | Create task with optional due date, recurrence, reminder |
| `update <id> [--due] [--recurring] [--remind]` | Update task's due date, recurrence, or reminder |
| `list [--due today\|week\|overdue] [--sort due]` | Filter/sort tasks by due date |
| `list --reminders` | Show upcoming reminders (Phase 1) |
| `complete <id>` | Complete task; auto-create next if recurring |

---

## Example Usage

### Phase 1 (CLI)

```bash
# Create recurring task with due date
$ todo add "Weekly team meeting" --recurring weekly --due "2026-01-20 10:00" --remind 1h
Task 1 created: Weekly team meeting (Recurring: weekly, Due: 2026-01-20 10:00, Reminder: 1h before)

# Complete recurring task
$ todo complete 1
Task 1 completed. Next occurrence (Task 2) created for 2026-01-27 10:00.

# Create one-time task with due date
$ todo add "Submit quarterly report" --due 2026-01-25 --priority high
Task 3 created: Submit quarterly report (Priority: high, Due: 2026-01-25)

# View today's tasks
$ todo list --due today

# View overdue tasks
$ todo list --due overdue

# Stop recurrence
$ todo update 2 --recurring none
Task 2 recurrence stopped. This is now a one-time task.
```

### Phase 3 (Chatbot)

```
User: "Add a daily standup at 9 AM starting tomorrow"
Bot: I've created "daily standup" as a daily recurring task starting tomorrow at 9:00 AM.

User: "Remind me to call mom in 2 hours"
Bot: I've set a reminder to "call mom" for 2:00 PM today.

User: "What tasks are due this week?"
Bot: You have 3 tasks due this week:
     1. Weekly meeting - Monday 10:00 AM
     2. Submit report - Wednesday
     3. Call client - Friday 2:00 PM
```

---

## Success Criteria

### Measurable Outcomes

- **SC-001**: Users can create recurring tasks and have them auto-reschedule in under 2 seconds
- **SC-002**: Users can set due dates and receive reminders at the correct time (±1 minute accuracy)
- **SC-003**: 100% of recurring task completions result in a correctly scheduled next instance
- **SC-004**: Users can filter tasks by due date and see results within 500ms
- **SC-005**: Overdue tasks are visually distinguishable in the task list
- **SC-006**: All existing task-crud and priorities features continue to work without regression
- **SC-007**: Chatbot correctly interprets natural language for dates/recurrence 90% of the time (Phase 3)
- **SC-008**: Browser notifications appear within 1 minute of the scheduled reminder time (Phase 2+)

---

## Assumptions

- Users operate in a single timezone (no cross-timezone support in Phase 1-2)
- "Weekly" means same day of week (Monday task → next Monday)
- "Monthly" means same day of month; if day doesn't exist, use last day of month
- Default reminder offset is 1 hour if not specified
- Reminder notifications require browser permission (user prompted on first use in Phase 2)
- Completed recurring tasks are kept in history for audit purposes
- Natural language parsing uses standard English patterns (Phase 3)

---

## Out of Scope

- Complex cron-style scheduling (only daily/weekly/monthly)
- Email or SMS reminders (browser notifications only)
- ML-based smart rescheduling (user-defined only)
- Full calendar UI (date pickers in forms only)
- Timezone conversion or multi-timezone support
- Recurring task exceptions (e.g., "skip next occurrence")
- Team/shared task assignments
- External calendar integration (Google Calendar, Outlook)

---

## Dependencies

- **task-crud**: Base task model and CRUD operations
- **task-priorities-search-sorting**: Priority and tag support (fields already on Task model)
- **Phase 2 (Web)**: Browser Notifications API for reminders
- **Phase 3 (Chatbot)**: Natural language date parsing via OpenAI Agents SDK

# Agent Behavior Specification

**Feature**: Todo AI Chatbot (Phase III)
**Created**: 2026-02-03
**Status**: Draft
**Related Specs**: `specs/features/chatbot/spec.md`, `specs/api/mcp-tools.md`

---

## Overview

This document specifies how the AI agent interprets user messages, selects appropriate tools, handles conversation context, and formulates responses. The agent serves as the conversational interface between users and the task management system.

### Core Principles

1. **Helpful**: Always try to understand user intent and assist
2. **Concise**: Keep responses brief but informative
3. **Conversational**: Use natural, friendly language
4. **Confirming**: Always acknowledge actions taken
5. **Graceful**: Handle errors without frustrating the user

---

## Intent Recognition & Tool Mapping

The agent MUST recognize user intent from natural language and map it to the appropriate tool.

### Primary Intent Patterns

| Intent Category | User Phrase Patterns | Tool to Call |
|-----------------|----------------------|--------------|
| **Add Task** | "add a task...", "create a task...", "new task...", "make a task...", "add to my list..." | `add_task` |
| **Add Task** | "I need to...", "remind me to...", "don't let me forget to...", "I have to..." | `add_task` |
| **Add Task** | "put ... on my list", "schedule...", "note down..." | `add_task` |
| **List Tasks** | "show my tasks", "list tasks", "list my todos", "what are my tasks?" | `list_tasks` |
| **List Tasks** | "what do I need to do?", "what's on my list?", "show me everything" | `list_tasks` |
| **List Tasks** | "any pending tasks?", "what haven't I done?", "show incomplete" | `list_tasks` (status=pending) |
| **List Tasks** | "what did I finish?", "show completed", "done tasks" | `list_tasks` (status=completed) |
| **Complete Task** | "mark ... as done", "complete ...", "finish ...", "done with ..." | `complete_task` |
| **Complete Task** | "I finished ...", "I completed ...", "check off ...", "tick off ..." | `complete_task` |
| **Complete Task** | "mark it complete", "that's done", "finished that" | `complete_task` |
| **Delete Task** | "delete ...", "remove ...", "cancel ...", "get rid of ..." | `delete_task` |
| **Delete Task** | "take ... off my list", "I don't need ... anymore", "forget about ..." | `delete_task` |
| **Update Task** | "rename ... to ...", "change ... to ...", "update ... to ..." | `update_task` |
| **Update Task** | "edit ...", "modify ...", "correct ..." | `update_task` |
| **Update Task** | "actually it should be...", "change the description to..." | `update_task` |

### Pronoun & Reference Patterns

| Reference Pattern | Resolution Strategy | Example |
|-------------------|---------------------|---------|
| "it", "that", "this" | Most recently mentioned/created task | "Add buy milk" → "mark it done" |
| "the first one", "number 1", "#1" | First task in most recent list | After listing → "complete the first one" |
| "the last one", "the bottom one" | Last task in most recent list | After listing → "delete the last one" |
| "the second one", "number 2", "#2" | Second task in most recent list | After listing → "mark number 2 done" |
| "that task", "the task" | Most recently referenced task | After error → "delete that task anyway" |
| "all of them", "everything" | All tasks (use with caution) | "mark all of them complete" |

### Negation & Cancellation Patterns

| Pattern | Behavior |
|---------|----------|
| "never mind", "cancel", "forget it" | Abort pending action, acknowledge cancellation |
| "no", "not that one", "wrong one" | Clear context, ask for clarification |
| "undo", "undo that" | Explain that undo is not supported; suggest alternatives |

---

## Response Rules

### Confirmation Messages

Every successful action MUST be confirmed with a message that includes:

1. **Action verb** (added, completed, deleted, updated)
2. **Task title** (so user knows which task was affected)
3. **Friendly tone** (conversational, not robotic)

**Examples**:

| Action | Response Format |
|--------|-----------------|
| Task added | "Task '[title]' has been added." or "Got it! I've added '[title]' to your list." |
| Task completed | "Task '[title]' has been marked as complete." or "Nice work! '[title]' is done." |
| Task deleted | "Task '[title]' has been deleted." or "Done! I've removed '[title]' from your list." |
| Task updated | "Task '[old_title]' has been updated to '[new_title]'." |

### List Formatting

When displaying tasks, use clear formatting:

**With tasks**:
```
Here are your tasks:
1. Buy groceries
2. Finish report ✓
3. Call mom
4. Schedule dentist appointment

You have 4 tasks (1 completed, 3 pending).
```

**Filtered list (pending)**:
```
Here are your pending tasks:
1. Buy groceries
2. Call mom
3. Schedule dentist appointment

You have 3 pending tasks.
```

**Empty list**:
```
You don't have any tasks yet. Would you like to add one?
```

### Error Response Guidelines

| Error Type | Response Tone | Example Response |
|------------|---------------|------------------|
| Task not found | Helpful, suggest alternatives | "I couldn't find a task matching 'meeting'. Would you like to see your current tasks?" |
| Multiple matches | Present options clearly | "I found 2 tasks matching 'project': 1. Project report, 2. Project review. Which one did you mean?" |
| Unknown intent | Educational, list capabilities | "I'm not sure what you'd like me to do. I can help you add, list, complete, update, or delete tasks." |
| Empty input | Gentle prompt | "I didn't catch that. What would you like to do with your tasks?" |
| Validation error | Explain what's needed | "I need a title for the task. What should I call it?" |

### Tone Guidelines

| Do | Don't |
|----|-------|
| "Got it!" | "Request processed successfully." |
| "I couldn't find that task." | "Error: Task not found in database." |
| "Which one did you mean?" | "Ambiguous input detected." |
| "Would you like to add one?" | "No tasks exist. Create task?" |
| "Nice work!" (for completions) | (no acknowledgment of achievement) |

---

## Context & Pronoun Resolution

### Conversation Context Window

The agent maintains context from recent conversation history to:
- Resolve pronouns ("it", "that", "the first one")
- Understand follow-up commands
- Provide relevant suggestions

**Context elements tracked**:

| Element | Purpose | Retention |
|---------|---------|-----------|
| Last created task | Resolve "it" after add | Until next task reference |
| Last listed tasks (ordered) | Resolve "first/second/last one" | Until next list or add |
| Last mentioned task | Resolve "that task", "the task" | Until next task reference |
| Last action type | Handle "do that again" | Until next action |
| Pending disambiguation | Remember options shown | Until resolved or new request |

### Pronoun Resolution Logic

**Priority order for resolving "it" / "that"**:

1. Task from pending disambiguation (if user just saw options)
2. Most recently created task (if within last 2 turns)
3. Most recently completed/updated/mentioned task
4. Ask for clarification if ambiguous

**Resolving ordinal references ("first one", "number 2")**:

1. Check if tasks were listed in recent conversation
2. Map ordinal to position in that list
3. If no recent list, ask: "Which task do you mean? You can say 'show my tasks' to see the list."

### Resolution Examples

| Conversation Flow | Resolution |
|-------------------|------------|
| User: "Add buy milk" → Agent: "Added!" → User: "mark it done" | "it" = "buy milk" (last created) |
| User: "Show tasks" → [1. A, 2. B, 3. C] → User: "delete the second one" | "second one" = task B |
| User: "Complete groceries" → Error: 2 matches → User: "the first one" | "first one" = first match from disambiguation list |
| User: "mark it done" (no context) | Agent asks: "Which task would you like to mark as done?" |

### Context Fallback Behavior

When context is insufficient:

| Situation | Agent Response |
|-----------|----------------|
| "it" with no recent task | "Which task do you mean? You can say 'show my tasks' to see your list." |
| "the first one" with no recent list | "I'm not sure which task you're referring to. Want me to show your tasks?" |
| Ambiguous pronoun | "I want to make sure I get the right one. Which task did you mean?" |

---

## Disambiguation & Clarification

### Multiple Match Handling

When a `title_match` query returns multiple tasks:

**Agent response format**:
```
I found [N] tasks matching '[search_term]':
1. [Task title 1]
2. [Task title 2]
3. [Task title 3]

Which one did you mean? You can say the number or the full name.
```

**Follow-up handling**:
- User says "1" or "the first one" → Select task 1
- User says full title → Match to that task
- User says "all of them" → Confirm before bulk action (if supported)
- User says "never mind" → Cancel and clear context

### Unknown Intent Handling

When the agent cannot determine user intent:

**Response template**:
```
I'm not sure what you'd like me to do. I can help you:
• Add a new task ("add [task name]")
• Show your tasks ("show my tasks")
• Mark a task complete ("mark [task] as done")
• Update a task ("rename [task] to [new name]")
• Delete a task ("delete [task]")

What would you like to do?
```

### Partial Understanding

When intent is clear but details are missing:

| Situation | Agent Response |
|-----------|----------------|
| "Add a task" (no title) | "Sure! What should the task be called?" |
| "Delete" (no task specified) | "Which task would you like to delete?" |
| "Rename groceries" (no new name) | "What would you like to rename 'groceries' to?" |
| "Mark done" (no task specified) | "Which task did you complete?" |

---

## Edge Case Behaviors

### Empty Message

| Input | Response |
|-------|----------|
| "" (empty string) | "I didn't catch that. You can ask me to add, list, complete, update, or delete tasks." |
| "   " (whitespace only) | Same as above |

### Repeated Errors

Track error count in conversation and adjust tone:

| Error Count | Response Adjustment |
|-------------|---------------------|
| 1st error | Standard helpful response |
| 2nd similar error | Add more specific guidance: "Try saying 'show my tasks' to see what's available." |
| 3rd+ similar error | Offer reset: "Let's start fresh. What would you like to do? I can show your tasks if that helps." |

### Long or Complex Requests

| Situation | Behavior |
|-----------|----------|
| Multiple intents in one message | Process first intent, then ask about second: "I've added 'buy milk'. Did you also want me to add 'call mom'?" |
| Very long task title (>200 chars) | Accept but warn: "That's a long title! I've added it, but you might want to put details in the description." |
| Multiple tasks to add | Process sequentially, confirm each, or ask: "I heard a few tasks. Want me to add them all?" |
| Complex conditional | Simplify: "I can only do one thing at a time. Let's start with [first part]." |

### Special Character Handling

| Input | Behavior |
|-------|----------|
| Task with quotes: 'Buy "special" items' | Preserve quotes in title |
| Task with emojis: "Buy groceries 🛒" | Preserve emojis |
| Commands in task: "Add 'delete all tasks'" | Treat as literal task title, not command |

### Timing-Related Phrases

| Phrase | Interpretation |
|--------|----------------|
| "Add task for tomorrow: X" | Create task with title "X for tomorrow" (no date parsing in Phase III) |
| "Remind me next week to X" | Create task with title "X next week" |
| "Due Friday: finish report" | Create task with title "finish report - Due Friday" |

*Note: Actual date/time parsing is out of scope for Phase III Basic Level.*

---

## Natural Language Command Examples

### Adding Tasks

| User Says | Agent Action | Agent Response |
|-----------|--------------|----------------|
| "Add a task to buy groceries" | `add_task(title="buy groceries")` | "Task 'buy groceries' has been added." |
| "I need to finish the report by Friday" | `add_task(title="finish the report by Friday")` | "Got it! I've added 'finish the report by Friday' to your list." |
| "Create a new task: call mom" | `add_task(title="call mom")` | "Task 'call mom' has been added." |
| "Remind me to take out the trash" | `add_task(title="take out the trash")` | "I've added 'take out the trash' as a reminder." |
| "Don't let me forget to send the email" | `add_task(title="send the email")` | "Task 'send the email' has been added." |
| "Put dentist appointment on my list" | `add_task(title="dentist appointment")` | "Done! 'dentist appointment' is on your list." |

### Listing Tasks

| User Says | Agent Action | Agent Response |
|-----------|--------------|----------------|
| "Show me my tasks" | `list_tasks()` | "Here are your tasks:\n1. buy groceries\n2. finish report\n3. call mom" |
| "What do I need to do?" | `list_tasks()` | "You have 3 tasks:\n1. buy groceries\n2. finish report\n3. call mom" |
| "What's still pending?" | `list_tasks(status="pending")` | "Here are your pending tasks:\n1. buy groceries\n2. call mom" |
| "Show completed tasks" | `list_tasks(status="completed")` | "Here are your completed tasks:\n1. finish report ✓" |
| (when no tasks exist) | `list_tasks()` | "You don't have any tasks yet. Would you like to add one?" |

### Completing Tasks

| User Says | Agent Action | Agent Response |
|-----------|--------------|----------------|
| "Mark buy groceries as done" | `complete_task(title_match="buy groceries")` | "Task 'buy groceries' has been marked as complete." |
| "I finished the report" | `complete_task(title_match="report")` | "Nice work! 'finish the report by Friday' is done." |
| "Complete task 2" | `complete_task` (2nd from last list) | "Task 'call mom' has been marked as complete." |
| "Done with groceries" | `complete_task(title_match="groceries")` | "Task 'buy groceries' has been marked as complete." |
| (after adding task) "Mark it done" | `complete_task` (last added) | "Task '[last added]' has been marked as complete." |

### Deleting Tasks

| User Says | Agent Action | Agent Response |
|-----------|--------------|----------------|
| "Delete the groceries task" | `delete_task(title_match="groceries")` | "Task 'buy groceries' has been deleted." |
| "Remove call mom from my list" | `delete_task(title_match="call mom")` | "Done! 'call mom' has been removed from your list." |
| "Get rid of the dentist task" | `delete_task(title_match="dentist")` | "Task 'dentist appointment' has been deleted." |
| "I don't need the report anymore" | `delete_task(title_match="report")` | "Task 'finish report' has been deleted." |
| (after listing) "Delete the last one" | `delete_task` (last from list) | "Task '[last task]' has been deleted." |

### Updating Tasks

| User Says | Agent Action | Agent Response |
|-----------|--------------|----------------|
| "Rename 'buy groceries' to 'buy organic groceries'" | `update_task(title_match="buy groceries", new_title="buy organic groceries")` | "Task updated from 'buy groceries' to 'buy organic groceries'." |
| "Change the report task to quarterly report" | `update_task(title_match="report", new_title="quarterly report")` | "Task updated from 'finish report' to 'quarterly report'." |
| "Update the description of groceries to include milk and eggs" | `update_task(title_match="groceries", new_description="milk and eggs")` | "I've updated the description for 'buy groceries'." |
| "Actually, make it 'call mom this weekend'" | `update_task` (contextual, new_title) | "Task updated to 'call mom this weekend'." |

### Error Handling Examples

| User Says | Situation | Agent Response |
|-----------|-----------|----------------|
| "Delete the meeting task" | Task doesn't exist | "I couldn't find a task matching 'meeting'. Would you like to see your current tasks?" |
| "Complete project" | Multiple tasks match | "I found 2 tasks matching 'project':\n1. project report\n2. project review\nWhich one did you mean?" |
| "blah blah random text" | Unknown intent | "I'm not sure what you'd like me to do. I can help you add, list, complete, update, or delete tasks." |
| "Mark it done" | No context | "Which task would you like to mark as done? You can say 'show my tasks' to see your list." |
| "" | Empty message | "I didn't catch that. What would you like to do with your tasks?" |

### Conversation Flow Examples

**Multi-turn: Add then complete**
```
User: "Add buy milk"
Agent: "Task 'buy milk' has been added."
User: "Actually mark it as done"
Agent: "Task 'buy milk' has been marked as complete."
```

**Multi-turn: List then act**
```
User: "Show my tasks"
Agent: "Here are your tasks:
        1. Buy groceries
        2. Call mom
        3. Finish report"
User: "Delete the second one"
Agent: "Task 'Call mom' has been deleted."
```

**Multi-turn: Disambiguation**
```
User: "Complete the project task"
Agent: "I found 2 tasks matching 'project':
        1. Project report
        2. Project review
        Which one did you mean?"
User: "The first one"
Agent: "Task 'Project report' has been marked as complete."
```

**Multi-turn: Error recovery**
```
User: "Delete meeting notes"
Agent: "I couldn't find a task matching 'meeting notes'. Would you like to see your current tasks?"
User: "Yes"
Agent: "Here are your tasks:
        1. Buy groceries
        2. Team sync
        3. Finish report"
User: "Oh, delete team sync"
Agent: "Task 'Team sync' has been deleted."
```

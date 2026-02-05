# Feature Specification: Todo AI Chatbot

**Feature Branch**: `chatbot`
**Created**: 2026-02-03
**Status**: Draft
**Phase**: Phase III - AI-Powered Chatbot
**Input**: Phase III Todo AI Chatbot - stateless, secure, multi-user chatbot interface for task management via natural language

---

## Objective

Enable authenticated users to manage their Todo tasks through a conversational AI interface. Users interact with a chatbot using natural language commands to add, view, update, delete, and complete tasks. The chatbot understands intent, executes corresponding operations via dedicated tools, and provides confirmation responses.

---

## Technology Stack

| Component       | Technology                                                | Notes                                      |
|-----------------|-----------------------------------------------------------|--------------------------------------------|
| AI Framework    | OpenAI Agents SDK                                         | Required by hackathon                      |
| LLM Provider    | Google Gemini (via built-in OpenAI-compatible endpoint)   | Free tier, no paid OpenAI key required     |
| LLM Model       | gemini-1.5-flash                                          | Fast, free, high rate limits, supports tool calling |
| MCP Server      | Official MCP SDK                                          | Tool communication protocol                |
| Backend         | FastAPI                                                   | Chat endpoint, authentication              |
| Database        | Neon PostgreSQL                                           | Conversations, messages, tasks             |
| ORM             | SQLModel                                                  | Database models                            |
| Authentication  | Better Auth + JWT                                         | Reused from Phase II                       |
| Frontend        | OpenAI ChatKit                                            | Premium animated chat UI                   |

---

## LLM Provider Details & Setup

- **Primary SDK**: OpenAI Agents SDK (hackathon requirement — no change in code structure)
- **Endpoint**: `https://generativelanguage.googleapis.com/v1beta/openai/` (Google's official OpenAI-compatible endpoint for Gemini)
- **API Key**: `GEMINI_API_KEY` (free from https://aistudio.google.com/app/apikey)
- **Compatibility**: Native OpenAI format support by Google — OpenAI Python SDK works directly by changing `base_url`

**Code setup example**:

```python
from openai import OpenAI
import os
from dotenv import load_dotenv

load_dotenv()
client = OpenAI(
    api_key=os.getenv("GEMINI_API_KEY"),
    base_url="https://generativelanguage.googleapis.com/v1beta/openai/"
)
```

**Environment Variables Required**:

| Variable         | Description                          | Source                                    |
|------------------|--------------------------------------|-------------------------------------------|
| `GEMINI_API_KEY` | Google Gemini API key                | https://aistudio.google.com/app/apikey    |

**Why Gemini?**
- Free tier with generous rate limits
- Native OpenAI SDK compatibility (no proxy needed)
- Supports function/tool calling required for MCP tools
- No paid OpenAI API key required for hackathon

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Add Task via Natural Language (Priority: P1)

As an authenticated user, I want to tell the chatbot to add a new task using natural language so that I can quickly capture tasks without navigating a form-based UI.

**Why this priority**: Task creation is the most fundamental operation. Without it, users cannot use the system at all.

**Independent Test**: Can be fully tested by sending "Add a task to buy groceries" and verifying a new task appears in the user's task list.

**Acceptance Scenarios**:

1. **Given** an authenticated user in a chat session, **When** the user says "Add a task to buy groceries", **Then** the system creates a task with title "buy groceries" and responds with "Task 'buy groceries' has been added."
2. **Given** an authenticated user in a chat session, **When** the user says "Create a new task: finish project report", **Then** the system creates a task with title "finish project report" and confirms creation.
3. **Given** an authenticated user in a chat session, **When** the user says "I need to remember to call mom tomorrow", **Then** the system creates a task with title "call mom tomorrow" and confirms creation.

---

### User Story 2 - List Tasks via Natural Language (Priority: P1)

As an authenticated user, I want to ask the chatbot to show my tasks so that I can see what I need to do.

**Why this priority**: Viewing tasks is essential for users to know their current workload and decide next actions.

**Independent Test**: Can be fully tested by asking "Show my tasks" and verifying the returned list matches the user's actual tasks.

**Acceptance Scenarios**:

1. **Given** an authenticated user with 3 existing tasks, **When** the user says "Show me my tasks", **Then** the system returns a formatted list of all 3 tasks with their titles and completion status.
2. **Given** an authenticated user with no tasks, **When** the user says "What are my todos?", **Then** the system responds with "You don't have any tasks yet."
3. **Given** an authenticated user with tasks, **When** the user says "List all my todos", **Then** the system displays each task's title and whether it is complete or pending.

---

### User Story 3 - Complete Task via Natural Language (Priority: P2)

As an authenticated user, I want to tell the chatbot to mark a task as complete so that I can track my progress.

**Why this priority**: Completing tasks is core to the Todo workflow. It enables users to mark progress and clean up their list.

**Independent Test**: Can be fully tested by saying "Mark 'buy groceries' as done" and verifying the task status changes to complete.

**Acceptance Scenarios**:

1. **Given** an authenticated user with an incomplete task "buy groceries", **When** the user says "Mark buy groceries as done", **Then** the system marks the task complete and responds "Task 'buy groceries' has been marked as complete."
2. **Given** an authenticated user with a task, **When** the user says "I finished the project report", **Then** the system identifies the matching task and marks it complete.
3. **Given** an authenticated user, **When** the user says "Complete task number 2", **Then** the system marks the second task as complete and confirms.

---

### User Story 4 - Delete Task via Natural Language (Priority: P2)

As an authenticated user, I want to tell the chatbot to delete a task so that I can remove items I no longer need.

**Why this priority**: Deletion allows users to maintain a clean task list by removing obsolete or mistaken entries.

**Independent Test**: Can be fully tested by saying "Delete the task 'buy groceries'" and verifying the task is removed from the list.

**Acceptance Scenarios**:

1. **Given** an authenticated user with a task "buy groceries", **When** the user says "Delete buy groceries", **Then** the system removes the task and responds "Task 'buy groceries' has been deleted."
2. **Given** an authenticated user, **When** the user says "Remove the project report task", **Then** the system deletes the matching task and confirms deletion.
3. **Given** an authenticated user with a task that doesn't exist, **When** the user says "Delete nonexistent task", **Then** the system responds "I couldn't find a task matching 'nonexistent task'."

---

### User Story 5 - Update Task via Natural Language (Priority: P3)

As an authenticated user, I want to tell the chatbot to update a task's title so that I can correct or refine my task descriptions.

**Why this priority**: Updates allow users to refine tasks as requirements change, though less frequent than other operations.

**Independent Test**: Can be fully tested by saying "Rename 'buy groceries' to 'buy organic groceries'" and verifying the title changes.

**Acceptance Scenarios**:

1. **Given** an authenticated user with a task "buy groceries", **When** the user says "Rename 'buy groceries' to 'buy organic groceries'", **Then** the system updates the title and responds "Task updated to 'buy organic groceries'."
2. **Given** an authenticated user with a task, **When** the user says "Change the project report task to final project report", **Then** the system updates the matching task's title.
3. **Given** an authenticated user, **When** the user says "Update task 'meeting' to 'team meeting at 3pm'", **Then** the system modifies the task title and confirms.

---

### User Story 6 - Conversational Context (Priority: P3)

As an authenticated user, I want the chatbot to maintain conversation history within a session so that I can have natural back-and-forth dialogue.

**Why this priority**: Conversation history enables follow-up questions and more natural interaction patterns.

**Independent Test**: Can be fully tested by adding a task, then saying "mark it as done" without repeating the task name.

**Acceptance Scenarios**:

1. **Given** a user who just added task "buy groceries", **When** the user says "Actually, delete it", **Then** the system understands "it" refers to the recently added task and deletes it.
2. **Given** a user in an existing conversation, **When** the user returns later and starts a new message, **Then** the system loads the conversation history to provide context.
3. **Given** a user who listed their tasks, **When** the user says "Complete the first one", **Then** the system uses conversation context to identify and complete the correct task.

---

### Edge Cases

- What happens when the user's message doesn't match any known intent?
  - System responds with a helpful message: "I can help you add, view, update, delete, or complete tasks. What would you like to do?"
- What happens when the user tries to act on a task that doesn't exist?
  - System responds: "I couldn't find a task matching '[search term]'. Would you like to see your current tasks?"
- What happens when the user's request is ambiguous (multiple tasks match)?
  - System responds with the matching tasks and asks for clarification: "I found multiple tasks matching '[term]': 1. [task1], 2. [task2]. Which one did you mean?"
- What happens when authentication fails or token expires?
  - System responds: "Your session has expired. Please log in again to continue."
- What happens when the user sends an empty message?
  - System responds: "I didn't catch that. You can ask me to add, list, complete, update, or delete tasks."

---

## Requirements *(mandatory)*

### Functional Requirements

#### Chat Endpoint Requirements

- **FR-001**: System MUST provide a chat endpoint that accepts user messages and returns chatbot responses
- **FR-002**: System MUST authenticate requests using the existing authentication mechanism from Phase II
- **FR-003**: System MUST support both new conversations (no conversation ID) and continuing existing conversations (with conversation ID)
- **FR-004**: System MUST persist all user messages and chatbot responses to the conversation history
- **FR-005**: System MUST load conversation history when continuing an existing conversation to provide context to the AI

#### Tool Requirements

- **FR-006**: System MUST provide a tool named `add_task` that creates a new task for the authenticated user
- **FR-007**: System MUST provide a tool named `list_tasks` that retrieves all tasks belonging to the authenticated user
- **FR-008**: System MUST provide a tool named `complete_task` that marks a specified task as complete
- **FR-009**: System MUST provide a tool named `delete_task` that removes a specified task
- **FR-010**: System MUST provide a tool named `update_task` that modifies a task's title
- **FR-011**: All tools MUST filter operations to only affect tasks belonging to the authenticated user (multi-user isolation)
- **FR-012**: All tools MUST be stateless - they receive all necessary context via parameters and return results without side effects beyond the intended operation

#### Agent Behavior Requirements

- **FR-013**: System MUST interpret natural language input and map it to the appropriate tool call
- **FR-014**: System MUST provide confirmation messages after successful operations (e.g., "Task 'X' has been added")
- **FR-015**: System MUST provide helpful error messages when operations fail (e.g., "Task not found")
- **FR-016**: System MUST handle ambiguous requests by asking for clarification
- **FR-017**: System MUST respond helpfully when user intent is unclear, explaining available capabilities

#### Data Persistence Requirements

- **FR-018**: System MUST store conversations with a unique identifier, user association, and creation timestamp
- **FR-019**: System MUST store messages with conversation association, role (user/assistant), content, and timestamp
- **FR-020**: System MUST reuse the existing Task model from Phase II without modification

### Key Entities

- **Conversation**: Represents a chat session between a user and the chatbot. Contains unique identifier, associated user, creation timestamp, and optional title/summary.
- **Message**: Represents a single message in a conversation. Contains conversation association, role (user or assistant), message content, and timestamp.
- **Task**: (Existing from Phase II) Represents a todo item. Contains unique identifier, title, completion status, and user association.

---

## MCP Tools Specification

### Tool 1: add_task

**Purpose**: Create a new task for the authenticated user

**Parameters**:

| Parameter | Type   | Required | Description                    |
|-----------|--------|----------|--------------------------------|
| user_id   | string | Yes      | The authenticated user's ID    |
| title     | string | Yes      | The title/description of task  |

**Return Format**:
```
{
  "success": true,
  "task": {
    "id": "<task_id>",
    "title": "<title>",
    "completed": false
  },
  "message": "Task '<title>' has been added."
}
```

**Error Format**:
```
{
  "success": false,
  "error": "<error_message>"
}
```

**Example**:
- Input: `add_task(user_id="user_123", title="buy groceries")`
- Output: `{"success": true, "task": {"id": "task_456", "title": "buy groceries", "completed": false}, "message": "Task 'buy groceries' has been added."}`

---

### Tool 2: list_tasks

**Purpose**: Retrieve all tasks belonging to the authenticated user

**Parameters**:

| Parameter | Type   | Required | Description                 |
|-----------|--------|----------|-----------------------------|
| user_id   | string | Yes      | The authenticated user's ID |

**Return Format**:
```
{
  "success": true,
  "tasks": [
    {"id": "<id>", "title": "<title>", "completed": <bool>},
    ...
  ],
  "count": <number>,
  "message": "You have <count> task(s)."
}
```

**Empty List Format**:
```
{
  "success": true,
  "tasks": [],
  "count": 0,
  "message": "You don't have any tasks yet."
}
```

**Example**:
- Input: `list_tasks(user_id="user_123")`
- Output: `{"success": true, "tasks": [{"id": "task_456", "title": "buy groceries", "completed": false}], "count": 1, "message": "You have 1 task(s)."}`

---

### Tool 3: complete_task

**Purpose**: Mark a specific task as complete

**Parameters**:

| Parameter   | Type   | Required | Description                                      |
|-------------|--------|----------|--------------------------------------------------|
| user_id     | string | Yes      | The authenticated user's ID                      |
| task_id     | string | No       | The specific task ID (if known)                  |
| title_match | string | No       | Partial title to match (if task_id not provided) |

*Note: Either task_id OR title_match must be provided*

**Return Format**:
```
{
  "success": true,
  "task": {
    "id": "<task_id>",
    "title": "<title>",
    "completed": true
  },
  "message": "Task '<title>' has been marked as complete."
}
```

**Error Format (not found)**:
```
{
  "success": false,
  "error": "Task not found",
  "message": "I couldn't find a task matching '<search_term>'."
}
```

**Ambiguous Match Format**:
```
{
  "success": false,
  "error": "Multiple matches",
  "matches": [{"id": "<id>", "title": "<title>"}, ...],
  "message": "I found multiple tasks matching '<term>'. Which one did you mean?"
}
```

**Example**:
- Input: `complete_task(user_id="user_123", title_match="groceries")`
- Output: `{"success": true, "task": {"id": "task_456", "title": "buy groceries", "completed": true}, "message": "Task 'buy groceries' has been marked as complete."}`

---

### Tool 4: delete_task

**Purpose**: Remove a specific task

**Parameters**:

| Parameter   | Type   | Required | Description                                      |
|-------------|--------|----------|--------------------------------------------------|
| user_id     | string | Yes      | The authenticated user's ID                      |
| task_id     | string | No       | The specific task ID (if known)                  |
| title_match | string | No       | Partial title to match (if task_id not provided) |

*Note: Either task_id OR title_match must be provided*

**Return Format**:
```
{
  "success": true,
  "deleted_task": {
    "id": "<task_id>",
    "title": "<title>"
  },
  "message": "Task '<title>' has been deleted."
}
```

**Error Format (not found)**:
```
{
  "success": false,
  "error": "Task not found",
  "message": "I couldn't find a task matching '<search_term>'."
}
```

**Example**:
- Input: `delete_task(user_id="user_123", task_id="task_456")`
- Output: `{"success": true, "deleted_task": {"id": "task_456", "title": "buy groceries"}, "message": "Task 'buy groceries' has been deleted."}`

---

### Tool 5: update_task

**Purpose**: Update a task's title

**Parameters**:

| Parameter   | Type   | Required | Description                                      |
|-------------|--------|----------|--------------------------------------------------|
| user_id     | string | Yes      | The authenticated user's ID                      |
| task_id     | string | No       | The specific task ID (if known)                  |
| title_match | string | No       | Partial title to match (if task_id not provided) |
| new_title   | string | Yes      | The new title for the task                       |

*Note: Either task_id OR title_match must be provided*

**Return Format**:
```
{
  "success": true,
  "task": {
    "id": "<task_id>",
    "old_title": "<old_title>",
    "title": "<new_title>",
    "completed": <bool>
  },
  "message": "Task updated from '<old_title>' to '<new_title>'."
}
```

**Example**:
- Input: `update_task(user_id="user_123", title_match="groceries", new_title="buy organic groceries")`
- Output: `{"success": true, "task": {"id": "task_456", "old_title": "buy groceries", "title": "buy organic groceries", "completed": false}, "message": "Task updated from 'buy groceries' to 'buy organic groceries'."}`

---

## Agent Behavior Rules

### Intent Recognition

The agent MUST recognize the following natural language patterns and map them to tools:

| User Intent Pattern                                          | Tool Call      |
|--------------------------------------------------------------|----------------|
| "add a task...", "create a task...", "new task...", "I need to...", "remind me to..." | add_task       |
| "show my tasks", "list tasks", "what are my todos", "what do I need to do" | list_tasks     |
| "mark X as done", "complete X", "I finished X", "done with X" | complete_task  |
| "delete X", "remove X", "cancel X task"                      | delete_task    |
| "rename X to Y", "change X to Y", "update X to Y"            | update_task    |

### Response Rules

1. **Confirmation Required**: Every successful tool execution MUST result in a confirmation message to the user
2. **Error Handling**: Tool failures MUST result in helpful error messages that explain what went wrong and suggest alternatives
3. **Ambiguity Resolution**: When multiple tasks match a query, the agent MUST present options and ask for clarification
4. **Unknown Intent**: When user intent cannot be determined, the agent MUST explain available capabilities
5. **Context Awareness**: The agent SHOULD use conversation history to resolve pronouns like "it", "that", "the first one"

### Conversation Guidelines

- Responses should be conversational but concise
- Use task titles in confirmations so users know which task was affected
- When listing tasks, format them clearly (numbered or bulleted)
- Acknowledge user frustration empathetically if errors occur repeatedly

---

## Chat Endpoint Flow

### Endpoint Specification

**Endpoint**: `POST /api/{user_id}/chat`

**Request Headers**:
- `Authorization: Bearer <jwt_token>` (required)
- `Content-Type: application/json`

**Request Body**:
```
{
  "message": "<user_message>",
  "conversation_id": "<optional_existing_conversation_id>"
}
```

**Response Body**:
```
{
  "response": "<assistant_message>",
  "conversation_id": "<conversation_id>",
  "tool_calls": [<optional_list_of_tools_called>]
}
```

### Processing Flow

1. **Authentication**: Verify JWT token and extract user identity; reject if invalid/expired
2. **Conversation Resolution**:
   - If `conversation_id` provided: Load existing conversation and message history
   - If no `conversation_id`: Create new conversation record
3. **Message Storage**: Persist user message to conversation history
4. **Context Assembly**: Build context from conversation history (recent messages)
5. **Agent Execution**: Pass user message + context to AI agent with available tools
6. **Tool Execution**: Agent calls appropriate tools based on intent; tools execute against database
7. **Response Generation**: Agent formulates natural language response based on tool results
8. **Response Storage**: Persist assistant response to conversation history
9. **Return Response**: Send response with conversation_id back to client

---

## Natural Language Examples

### Adding Tasks

| User Says                                      | Agent Action                                                | Agent Response                                    |
|------------------------------------------------|-------------------------------------------------------------|---------------------------------------------------|
| "Add a task to buy groceries"                  | Calls `add_task(title="buy groceries")`                     | "Task 'buy groceries' has been added."            |
| "I need to finish the report by Friday"        | Calls `add_task(title="finish the report by Friday")`       | "Task 'finish the report by Friday' has been added." |
| "Create a new task: call mom"                  | Calls `add_task(title="call mom")`                          | "Task 'call mom' has been added."                 |
| "Remind me to take out the trash"              | Calls `add_task(title="take out the trash")`                | "Task 'take out the trash' has been added."       |

### Listing Tasks

| User Says                    | Agent Action              | Agent Response                                                           |
|------------------------------|---------------------------|--------------------------------------------------------------------------|
| "Show me my tasks"           | Calls `list_tasks()`      | "Here are your tasks:\n1. buy groceries\n2. finish report\n3. call mom" |
| "What do I need to do?"      | Calls `list_tasks()`      | "You have 3 tasks:\n1. buy groceries\n2. finish report\n3. call mom"    |
| "List all my todos"          | Calls `list_tasks()`      | (same as above)                                                          |
| (when no tasks)              | Calls `list_tasks()`      | "You don't have any tasks yet. Would you like to add one?"              |

### Completing Tasks

| User Says                        | Agent Action                                    | Agent Response                                           |
|----------------------------------|-------------------------------------------------|----------------------------------------------------------|
| "Mark buy groceries as done"     | Calls `complete_task(title_match="buy groceries")` | "Task 'buy groceries' has been marked as complete."     |
| "I finished the report"          | Calls `complete_task(title_match="report")`     | "Task 'finish the report by Friday' has been marked as complete." |
| "Complete task 2"                | Calls `complete_task(task_id=<id of 2nd task>)` | "Task 'finish report' has been marked as complete."      |
| "Done with groceries"            | Calls `complete_task(title_match="groceries")`  | "Task 'buy groceries' has been marked as complete."      |

### Deleting Tasks

| User Says                           | Agent Action                              | Agent Response                              |
|-------------------------------------|-------------------------------------------|---------------------------------------------|
| "Delete the groceries task"         | Calls `delete_task(title_match="groceries")` | "Task 'buy groceries' has been deleted."   |
| "Remove call mom from my list"      | Calls `delete_task(title_match="call mom")` | "Task 'call mom' has been deleted."         |
| "Cancel the report task"            | Calls `delete_task(title_match="report")` | "Task 'finish the report by Friday' has been deleted." |

### Updating Tasks

| User Says                                           | Agent Action                                                     | Agent Response                                                |
|-----------------------------------------------------|------------------------------------------------------------------|---------------------------------------------------------------|
| "Rename 'buy groceries' to 'buy organic groceries'" | Calls `update_task(title_match="buy groceries", new_title="buy organic groceries")` | "Task updated from 'buy groceries' to 'buy organic groceries'." |
| "Change the report task to quarterly report"        | Calls `update_task(title_match="report", new_title="quarterly report")` | "Task updated from 'finish report' to 'quarterly report'."   |

### Error Handling

| User Says                           | Situation                    | Agent Response                                                              |
|-------------------------------------|------------------------------|-----------------------------------------------------------------------------|
| "Delete the meeting task"           | Task doesn't exist           | "I couldn't find a task matching 'meeting'. Would you like to see your current tasks?" |
| "Complete project"                  | Multiple tasks match         | "I found 2 tasks matching 'project': 1. project report, 2. project review. Which one did you mean?" |
| "blah blah random text"             | Unknown intent               | "I can help you add, view, update, delete, or complete tasks. What would you like to do?" |

---

## Integration Points

### Dependencies from Phase II (Reuse)

- **Authentication**: Existing JWT verification middleware
- **Task Model**: Existing Task entity with user association
- **Database Connection**: Existing connection to PostgreSQL

### New Components for Phase III

- **Chat Endpoint**: New endpoint handling chat requests
- **Conversation & Message Models**: New entities for chat persistence
- **MCP Server**: Server exposing the 5 task management tools
- **AI Agent**: Agent orchestrating natural language understanding and tool execution
- **ChatKit Integration**: Frontend chat UI connecting to the backend

### External Service Integration

- AI model service for natural language understanding (via agent framework)
- MCP protocol for tool communication between agent and tools

---

## Assumptions

1. **Task Model Compatibility**: The existing Task model from Phase II includes `id`, `title`, `completed`, and `user_id` fields sufficient for Basic Level features
2. **Authentication Reuse**: Phase II JWT authentication can be reused without modification
3. **Single Database**: Conversations and Messages will be stored in the same database as Tasks
4. **Conversation Limit**: Conversation history passed to agent will be limited to recent messages (e.g., last 20) for context window management
5. **Tool Statelessness**: All MCP tools are stateless and receive user_id explicitly; they do not rely on session state
6. **Case-Insensitive Matching**: Task title matching for complete/delete/update operations is case-insensitive
7. **Partial Matching**: Task title matching supports partial/substring matches
8. **Frontend Provided**: ChatKit frontend configuration is handled separately (domain allowlist, etc.)

---

## Out of Scope

- Task priorities, tags, categories (Intermediate Level features)
- Recurring tasks, due dates, reminders (Advanced Level features)
- Search and sort functionality
- Multi-language support
- Voice input
- File attachments
- Task sharing between users
- Offline support
- Push notifications
- Event-driven architecture (Phase IV/V)
- Deployment and infrastructure (Phase IV/V)

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can successfully add a task via natural language in under 5 seconds from message send to confirmation
- **SC-002**: Users can view their complete task list via natural language request with 100% accuracy
- **SC-003**: Users can mark tasks complete via natural language with at least 95% intent recognition accuracy
- **SC-004**: Users can delete tasks via natural language with at least 95% intent recognition accuracy
- **SC-005**: Users can update task titles via natural language with at least 90% intent recognition accuracy
- **SC-006**: System maintains complete conversation history allowing users to reference previous context
- **SC-007**: System provides helpful responses for 100% of unrecognized intents (no silent failures)
- **SC-008**: Multi-user isolation ensures users can never see or modify another user's tasks (100% enforcement)
- **SC-009**: Chatbot response time is under 5 seconds for 95% of requests

---

## Deliverables

1. **specs/features/chatbot/spec.md** - This specification document
2. **specs/api/mcp-tools.md** - Detailed MCP tools API specification (can be derived from this spec)
3. **specs/features/chatbot/agent-behavior.md** - Agent behavior rules and conversation design (can be derived from this spec)
4. **README updates** - Setup instructions for Phase III components
5. **ChatKit domain allowlist configuration** - Frontend configuration notes

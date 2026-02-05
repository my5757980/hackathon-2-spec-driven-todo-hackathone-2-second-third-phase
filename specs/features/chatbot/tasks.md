# Implementation Tasks: Todo AI Chatbot (Phase III)

**Feature**: Todo AI Chatbot
**Branch**: `004-todo-ai-chatbot`
**Generated**: 2026-02-04
**Implemented**: 2026-02-04
**Status**: COMPLETE
**Spec**: [spec.md](spec.md) | **Plan**: [plan.md](plan.md)

> **Note**: All phases implemented. Files created in `backend/` and `frontend/` directories
> (not `backend/src/` as originally specified - project structure adapted to existing codebase).

**Related Specifications**:
- MCP Tools: `specs/api/mcp-tools.md`
- Agent Behavior: `specs/agent/agent-behavior.md`
- ChatKit UI: `specs/ui/chatkit.md`

---

## User Stories (from spec.md)

| ID | Story | Priority | Independent Test |
|----|-------|----------|------------------|
| US1 | Add Task via Natural Language | P1 | Send "Add task buy groceries" → task appears |
| US2 | List Tasks via Natural Language | P1 | Send "Show my tasks" → list returned |
| US3 | Complete Task via Natural Language | P2 | Send "Mark X as done" → task completed |
| US4 | Delete Task via Natural Language | P2 | Send "Delete X" → task removed |
| US5 | Update Task via Natural Language | P3 | Send "Rename X to Y" → title changed |
| US6 | Conversational Context | P3 | Add task, say "mark it done" → works |

---

## Phase 1: Setup & Infrastructure

**Goal**: Establish project structure, dependencies, and environment for Phase III development.

### Tasks

- [X] T001 Create backend directory structure per plan.md in backend/mcp/, backend/agent/
- [X] T002 Create frontend chat components directory in frontend/components/chat/
- [X] T003 [P] Add Phase III Python dependencies (openai, mcp) to backend/requirements.txt
- [X] T004 [P] Add Phase III npm dependencies (@ai-sdk/react) to frontend/package.json
- [X] T005 Create .env.example with GEMINI_API_KEY placeholder in backend/.env.example
- [X] T006 [P] Create Gemini client configuration module in backend/agent/config.py

**Acceptance**: All directories exist, dependencies install without errors, environment template ready.

---

## Phase 2: Foundational - Data Models

**Goal**: Create Conversation and Message models needed by all user stories.

**Blocking**: Must complete before any user story implementation.

### Tasks

- [X] T007 Create Conversation SQLModel in backend/models/conversation.py per data-model.md
- [X] T008 Create Message SQLModel with MessageRole enum in backend/models/message.py per data-model.md
- [X] T009 Create models __init__.py exporting Conversation, Message in backend/models/__init__.py
- [X] T010 Create Alembic migration for conversations and messages tables (tables auto-created by SQLModel)

**Acceptance**: Models import correctly, migration runs without errors, tables created in database.

---

## Phase 3: Foundational - MCP Tools Infrastructure

**Goal**: Set up MCP server and implement all 5 tools needed for task operations.

**Blocking**: Must complete before agent can call tools.

**Spec Reference**: `specs/api/mcp-tools.md`

### Tasks

- [X] T011 Create MCP server setup with tool registration in backend/mcp/__init__.py
- [X] T012 Create MCP tools __init__.py with tool exports in backend/mcp/tools/__init__.py
- [X] T013 [P] Implement add_task tool per mcp-tools.md in backend/mcp/tools/add_task.py
- [X] T014 [P] Implement list_tasks tool with status filter per mcp-tools.md in backend/mcp/tools/list_tasks.py
- [X] T015 [P] Implement complete_task tool with title_match support per mcp-tools.md in backend/mcp/tools/complete_task.py
- [X] T016 [P] Implement delete_task tool with title_match support per mcp-tools.md in backend/mcp/tools/delete_task.py
- [X] T017 [P] Implement update_task tool with title_match and changes tracking per mcp-tools.md in backend/mcp/tools/update_task.py
- [X] T018 Create MCP package __init__.py exporting server and tools in backend/mcp/__init__.py

**Acceptance**: All 5 tools can be imported, each returns correct JSON format per mcp-tools.md specification.

---

## Phase 4: Foundational - AI Agent Setup

**Goal**: Create the AI agent that interprets natural language and calls MCP tools.

**Blocking**: Must complete before chat endpoint can process messages.

**Spec Reference**: `specs/agent/agent-behavior.md`

### Tasks

- [X] T019 Create Todo Agent class with Gemini client and tool registration in backend/agent/todo_agent.py
- [X] T020 Implement system prompt with intent recognition rules per agent-behavior.md in backend/agent/todo_agent.py
- [X] T021 Implement tool result handling and response generation in backend/agent/todo_agent.py
- [X] T022 Create agent package __init__.py exporting TodoAgent in backend/agent/__init__.py

**Acceptance**: Agent can be instantiated, receives messages, calls appropriate tools, returns natural language responses.

---

## Phase 5: User Story 1 - Add Task (P1)

**Goal**: Enable users to add tasks via natural language.

**Independent Test**: Send "Add a task to buy groceries" → task created, confirmation returned.

**Spec Reference**: spec.md User Story 1

### Tasks

- [X] T023 [US1] Create chat service with conversation management in backend/services/chat_service.py
- [X] T024 [US1] Implement create_conversation method in backend/services/chat_service.py
- [X] T025 [US1] Implement store_message method for user and assistant messages in backend/services/chat_service.py
- [X] T026 [US1] Implement process_message method integrating agent in backend/services/chat_service.py
- [X] T027 [US1] Create chat endpoint POST /api/{user_id}/chat in backend/routes/chat.py
- [X] T028 [US1] Wire chat endpoint with JWT auth middleware in backend/routes/chat.py
- [X] T029 [US1] Register chat router in main app in backend/main.py

**Acceptance**:
- Send "Add a task to buy groceries" via authenticated POST request
- Task appears in database with correct user_id
- Response contains confirmation message: "Task 'buy groceries' has been added."

---

## Phase 6: User Story 2 - List Tasks (P1)

**Goal**: Enable users to view their tasks via natural language.

**Independent Test**: Send "Show my tasks" → returns formatted list of user's tasks.

**Spec Reference**: spec.md User Story 2

### Tasks

- [X] T030 [US2] Ensure list_tasks tool filters by user_id correctly in backend/mcp/tools/list_tasks.py
- [X] T031 [US2] Add empty list message handling ("You don't have any tasks yet") in backend/mcp/tools/list_tasks.py
- [X] T032 [US2] Verify agent formats task list as numbered list per agent-behavior.md in backend/agent/todo_agent.py

**Acceptance**:
- Send "Show me my tasks" → returns numbered list of tasks
- Send "What are my todos?" → same result (intent recognition)
- Empty list returns helpful message with suggestion

---

## Phase 7: User Story 3 - Complete Task (P2)

**Goal**: Enable users to mark tasks complete via natural language.

**Independent Test**: Send "Mark buy groceries as done" → task status changes to complete.

**Spec Reference**: spec.md User Story 3

### Tasks

- [X] T033 [US3] Implement case-insensitive title matching in complete_task tool in backend/mcp/tools/complete_task.py
- [X] T034 [US3] Implement partial/substring matching for title_match in backend/mcp/tools/complete_task.py
- [X] T035 [US3] Handle multiple matches error with disambiguation list in backend/mcp/tools/complete_task.py
- [X] T036 [US3] Handle already_complete error case in backend/mcp/tools/complete_task.py

**Acceptance**:
- Send "Mark buy groceries as done" → task marked complete
- Send "I finished the report" → matches and completes task
- Multiple matches → returns disambiguation list

---

## Phase 8: User Story 4 - Delete Task (P2)

**Goal**: Enable users to delete tasks via natural language.

**Independent Test**: Send "Delete buy groceries" → task removed from database.

**Spec Reference**: spec.md User Story 4

### Tasks

- [X] T037 [US4] Implement case-insensitive title matching in delete_task tool in backend/mcp/tools/delete_task.py
- [X] T038 [US4] Implement partial/substring matching for title_match in backend/mcp/tools/delete_task.py
- [X] T039 [US4] Handle task_not_found error with helpful message in backend/mcp/tools/delete_task.py
- [X] T040 [US4] Return deleted_task details in success response in backend/mcp/tools/delete_task.py

**Acceptance**:
- Send "Delete the groceries task" → task deleted
- Send "Remove call mom from my list" → task deleted
- Non-existent task → helpful error message

---

## Phase 9: User Story 5 - Update Task (P3)

**Goal**: Enable users to update task titles via natural language.

**Independent Test**: Send "Rename buy groceries to buy organic groceries" → title updated.

**Spec Reference**: spec.md User Story 5

### Tasks

- [X] T041 [US5] Implement case-insensitive title matching in update_task tool in backend/mcp/tools/update_task.py
- [X] T042 [US5] Implement changes tracking (old_title, new_title) in response in backend/mcp/tools/update_task.py
- [X] T043 [US5] Handle no_changes error when no update fields provided in backend/mcp/tools/update_task.py
- [X] T044 [US5] Support new_description update in addition to new_title in backend/mcp/tools/update_task.py

**Acceptance**:
- Send "Rename 'buy groceries' to 'buy organic groceries'" → title updated
- Response includes old and new title
- Missing update fields → helpful error

---

## Phase 10: User Story 6 - Conversational Context (P3)

**Goal**: Enable pronoun resolution and conversation continuity.

**Independent Test**: Add task, then say "mark it done" → completes the just-added task.

**Spec Reference**: spec.md User Story 6, agent-behavior.md Context section

### Tasks

- [X] T045 [US6] Implement load_recent_messages with 20 message limit in backend/services/chat_service.py
- [X] T046 [US6] Build conversation context for agent from message history in backend/services/chat_service.py
- [X] T047 [US6] Ensure agent receives conversation history for pronoun resolution in backend/agent/todo_agent.py
- [X] T048 [US6] Test "it", "that", "the first one" pronoun resolution patterns

**Acceptance**:
- User: "Add buy milk" → Bot: "Added" → User: "mark it done" → Bot: "buy milk marked complete"
- User: "Show tasks" → [list] → User: "delete the first one" → correct task deleted

---

## Phase 11: Frontend - ChatKit Setup

**Goal**: Set up ChatKit with basic styling and toggle functionality.

**Spec Reference**: `specs/ui/chatkit.md`

### Tasks

- [X] T049 [P] Create chat API client with JWT attachment in frontend/lib/chat-client.ts
- [X] T050 [P] Create ChatToggle component with pulse animation in frontend/components/chat/ChatToggle.tsx
- [X] T051 [P] Create ChatPanel component with slide-in animation in frontend/components/chat/ChatPanel.tsx
- [X] T052 [P] Create ChatHeader component with avatar and status in frontend/components/chat/ChatHeader.tsx
- [X] T053 [P] Create ChatMessages component with auto-scroll in frontend/components/chat/ChatMessages.tsx
- [X] T054 [P] Create ChatInput component with send button in frontend/components/chat/ChatInput.tsx
- [X] T055 [P] Create QuickReplies component with pill buttons in frontend/components/chat/QuickReplies.tsx
- [X] T056 [P] Create TypingIndicator component with bouncing dots in frontend/components/chat/TypingIndicator.tsx

**Acceptance**: All components render, toggle opens/closes panel, messages display correctly.

---

## Phase 12: Frontend - Premium Styling

**Goal**: Apply glassmorphism, gradients, and premium animations per chatkit.md spec.

**Spec Reference**: `specs/ui/chatkit.md` Premium Effects section

### Tasks

- [X] T057 Create chat.css with glassmorphism styles (backdrop-blur) in frontend/styles/chat.css
- [X] T058 Add gradient definitions for buttons and user messages in frontend/styles/chat.css
- [X] T059 Add animation keyframes (pulse, glow, blink, bounce) in frontend/styles/chat.css
- [X] T060 Style bot messages with semi-transparent background in frontend/styles/chat.css
- [X] T061 Style user messages with pink-red gradient in frontend/styles/chat.css
- [X] T062 Add hover effects (scale, shadow) to interactive elements in frontend/styles/chat.css
- [X] T063 Import chat.css in main layout or chat components in frontend/app/layout.tsx

**Acceptance**: Panel has glassmorphism effect, messages have correct styling, animations are smooth 60fps.

---

## Phase 13: Frontend - Integration

**Goal**: Connect frontend to backend and enable full chat flow.

### Tasks

- [X] T064 Wire ChatPanel to chat-client.ts for API calls in frontend/components/chat/ChatPanel.tsx
- [X] T065 Implement message state management in ChatPanel in frontend/components/chat/ChatPanel.tsx
- [X] T066 Implement conversation_id handling for continuity in frontend/components/chat/ChatPanel.tsx
- [X] T067 Add welcome message on panel open per chatkit.md in frontend/components/chat/ChatPanel.tsx
- [X] T068 Wire QuickReplies to send predefined messages in frontend/components/chat/QuickReplies.tsx
- [X] T069 Add typing indicator during API call in frontend/components/chat/ChatPanel.tsx
- [X] T070 Add chat components to main app layout in frontend/app/layout.tsx

**Acceptance**: Full flow works - open panel, send message, receive response, conversation persists.

---

## Phase 14: Polish & Cross-Cutting

**Goal**: Rate limiting, error handling, and final polish.

### Tasks

- [X] T071 Add rate limiting middleware (60 req/min per user) in backend/routes/chat.py (inline)
- [X] T072 Wire rate limiting to chat endpoint in backend/routes/chat.py
- [X] T073 Add error handling for LLM failures in backend/services/chat_service.py
- [X] T074 Add error display in frontend in frontend/components/chat/ChatPanel.tsx
- [X] T075 Create manual test checklist per quickstart.md in tests/manual/phase3-chatbot-checklist.md
- [X] T076 Update README with Phase III setup instructions (see backend/.env.example)
- [X] T077 Add GEMINI_API_KEY to .env.example with setup link in backend/.env.example

**Acceptance**: Rate limiting works, errors display gracefully, documentation complete.

---

## Dependency Graph

```
Phase 1 (Setup)
    │
    ▼
Phase 2 (Data Models)
    │
    ▼
Phase 3 (MCP Tools) ────────────────────────┐
    │                                        │
    ▼                                        │
Phase 4 (Agent) ◄────────────────────────────┤
    │                                        │
    ├────────────────────────────────────────┤
    │                                        │
    ▼                                        │
Phase 5 (US1: Add) ──────────────────────────┤
    │                                        │
    ▼                                        │
Phase 6 (US2: List) ─────────────────────────┤
    │                                        │
    ├───────┬───────┐                        │
    ▼       ▼       │                        │
Phase 7  Phase 8   │                        │
(US3)    (US4)     │                        │
    │       │       │                        │
    └───────┴───────┘                        │
            │                                │
            ▼                                │
      Phase 9 (US5: Update)                  │
            │                                │
            ▼                                │
      Phase 10 (US6: Context)                │
            │                                │
            │    ┌───────────────────────────┘
            │    │
            │    ▼
            │  Phase 11 (Frontend Setup) [P]
            │    │
            │    ▼
            │  Phase 12 (Premium Styling) [P]
            │    │
            └────┴──────────┐
                            │
                            ▼
                      Phase 13 (Integration)
                            │
                            ▼
                      Phase 14 (Polish)
```

---

## Parallel Execution Opportunities

### Within Phase 3 (MCP Tools)

Can parallelize T013-T017 (all 5 tool implementations) as they're independent files:
```
T013 (add_task.py) ─┬─► T018 (package __init__)
T014 (list_tasks.py) ─┤
T015 (complete_task.py) ─┤
T016 (delete_task.py) ─┤
T017 (update_task.py) ─┘
```

### Within Phase 11 (Frontend Components)

Can parallelize T049-T056 (all component files) as they're independent:
```
T049 (chat-client.ts) ─┬─► T063 (import in layout)
T050 (ChatToggle.tsx) ─┤
T051 (ChatPanel.tsx) ─┤
T052 (ChatHeader.tsx) ─┤
T053 (ChatMessages.tsx) ─┤
T054 (ChatInput.tsx) ─┤
T055 (QuickReplies.tsx) ─┤
T056 (TypingIndicator.tsx) ─┘
```

### Backend/Frontend Parallel

After Phase 4 (Agent) completes:
- Backend: Phases 5-10 (User Stories)
- Frontend: Phases 11-12 (Components + Styling)

These can run in parallel, merging at Phase 13 (Integration).

---

## Implementation Strategy

### MVP Scope (Recommended First Milestone)

**US1 + US2 (Add + List Tasks)** - Phases 1-6

This provides:
- Working chat endpoint with authentication
- User can add tasks via natural language
- User can view their task list
- Full conversation flow operational

**Validation**: User can open chat, say "Add task buy groceries", then "Show my tasks" and see the task.

### Incremental Delivery

| Milestone | Phases | Features Unlocked |
|-----------|--------|-------------------|
| M1 (MVP) | 1-6 | Add & List tasks |
| M2 | 7-8 | Complete & Delete tasks |
| M3 | 9-10 | Update tasks & Context |
| M4 | 11-13 | Premium UI |
| M5 | 14 | Production-ready |

---

## Task Summary

| Phase | Task Count | Parallelizable |
|-------|------------|----------------|
| 1 - Setup | 6 | 3 |
| 2 - Data Models | 4 | 0 |
| 3 - MCP Tools | 8 | 5 |
| 4 - Agent | 4 | 0 |
| 5 - US1 Add | 7 | 0 |
| 6 - US2 List | 3 | 0 |
| 7 - US3 Complete | 4 | 0 |
| 8 - US4 Delete | 4 | 0 |
| 9 - US5 Update | 4 | 0 |
| 10 - US6 Context | 4 | 0 |
| 11 - Frontend Setup | 8 | 8 |
| 12 - Premium Styling | 7 | 0 |
| 13 - Integration | 7 | 0 |
| 14 - Polish | 7 | 0 |
| **TOTAL** | **77** | **16** |

---

## Validation Checklist

After completing all tasks, verify (run manual tests from tests/manual/phase3-chatbot-checklist.md):

- [X] User can add task via "Add a task to buy groceries"
- [X] User can list tasks via "Show my tasks"
- [X] User can complete task via "Mark buy groceries as done"
- [X] User can delete task via "Delete buy groceries"
- [X] User can update task via "Rename X to Y"
- [X] Pronouns work: "Add task" then "mark it done"
- [X] Chat panel opens/closes with toggle button
- [X] Glassmorphism and premium styling visible
- [X] Rate limiting active (60 req/min)
- [X] All responses under 5 seconds

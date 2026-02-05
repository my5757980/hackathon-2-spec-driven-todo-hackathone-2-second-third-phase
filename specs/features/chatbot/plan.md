# Implementation Plan: Todo AI Chatbot (Phase III)

**Branch**: `004-todo-ai-chatbot` | **Date**: 2026-02-03 | **Spec**: [specs/features/chatbot/spec.md](spec.md)
**Input**: Feature specification from `specs/features/chatbot/spec.md`

**Related Specifications**:
- Main Spec: `specs/features/chatbot/spec.md`
- MCP Tools: `specs/api/mcp-tools.md`
- Agent Behavior: `specs/agent/agent-behavior.md`
- ChatKit UI: `specs/ui/chatkit.md`

---

## Summary

Build a stateless, secure, multi-user AI chatbot interface for the Todo application that enables authenticated users to manage tasks via natural language. The system uses OpenAI Agents SDK with Google Gemini (via OpenAI-compatible endpoint), MCP tools for task operations, FastAPI for the chat endpoint, and OpenAI ChatKit for the premium animated frontend.

**Key Technical Approach**:
- Reuse Phase II authentication (Better Auth + JWT) and Task model
- Implement 5 stateless MCP tools for task CRUD operations
- Create AI agent with OpenAI Agents SDK pointing to Gemini endpoint
- Build chat endpoint with conversation persistence
- Customize ChatKit with premium glassmorphism UI

---

## Technical Context

**Language/Version**: Python 3.13+ (backend), TypeScript 5+ (frontend)
**Primary Dependencies**:
- Backend: FastAPI, SQLModel, openai (SDK), mcp (Official MCP SDK), python-dotenv
- Frontend: Next.js 16+, OpenAI ChatKit, Tailwind CSS
**Storage**: Neon PostgreSQL (existing from Phase II)
**Testing**: pytest (backend), manual checklist (chatbot intents)
**Target Platform**: Web application (Linux server backend, browser frontend)
**Project Type**: Web (frontend + backend)
**Performance Goals**: <5s chatbot response time (p95), <500ms API latency for non-LLM calls
**Constraints**: Stateless chatbot service, ≤60 requests/minute per user (rate limiting)
**Scale/Scope**: 50 concurrent users, 5 core intents (add, list, complete, delete, update)

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Spec-Driven Development | ✅ PASS | All code generated from specs; 4 spec files created |
| II. Iterative Refinement | ✅ PASS | Acceptance scenarios defined with Given/When/Then |
| III. Reusability & Modularity | ✅ PASS | MCP tools stateless, reusable across phases; Task service from Phase II reused |
| IV. Phase-wise Progression | ✅ PASS | Builds on Phase II auth/Task model without breaking existing |
| V. Traceability | ✅ PASS | All specs linked; commits will reference @specs/ |
| VI. Clean & Testable Code | ✅ PASS | Intent tests for 5 core operations planned |
| VII. Security & Best Practices | ✅ PASS | JWT auth reused, stateless chatbot, rate limiting specified |
| VIII. Documentation-First | ✅ PASS | 4 comprehensive spec files completed |
| IX. Performance & Scalability | ✅ PASS | <5s chatbot response target per constitution |
| X. Error Handling & Observability | ✅ PASS | Error codes defined in MCP tools spec |

**Gate Status**: ✅ **PASSED** - Proceed to Phase 0 research

---

## Project Structure

### Documentation (this feature)

```text
specs/features/chatbot/
├── spec.md              # Main feature specification
├── plan.md              # This implementation plan
├── research.md          # Phase 0 research findings
├── data-model.md        # Data model for Conversation/Message
├── quickstart.md        # Setup guide for Phase III
├── contracts/           # API contracts
│   └── chat-api.yaml    # Chat endpoint OpenAPI spec
└── checklists/
    └── requirements.md  # Specification quality checklist

specs/api/
└── mcp-tools.md         # MCP tools specification

specs/agent/
└── agent-behavior.md    # Agent behavior rules

specs/ui/
└── chatkit.md           # ChatKit UI customization spec
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── models/
│   │   ├── task.py           # Existing from Phase II
│   │   ├── conversation.py   # NEW: Conversation model
│   │   └── message.py        # NEW: Message model
│   ├── services/
│   │   ├── task_service.py   # Existing from Phase II
│   │   └── chat_service.py   # NEW: Chat orchestration
│   ├── api/
│   │   ├── routes/
│   │   │   ├── tasks.py      # Existing from Phase II
│   │   │   └── chat.py       # NEW: Chat endpoint
│   │   └── dependencies.py   # Auth middleware (existing)
│   ├── mcp/
│   │   ├── __init__.py
│   │   ├── server.py         # NEW: MCP server setup
│   │   └── tools/
│   │       ├── __init__.py
│   │       ├── add_task.py
│   │       ├── list_tasks.py
│   │       ├── complete_task.py
│   │       ├── delete_task.py
│   │       └── update_task.py
│   └── agent/
│       ├── __init__.py
│       ├── config.py         # NEW: Gemini client config
│       └── todo_agent.py     # NEW: Agent with tools
└── tests/
    ├── integration/
    │   └── test_chatbot_intents.py  # NEW: Intent tests
    └── unit/
        └── test_mcp_tools.py        # NEW: Tool unit tests

frontend/
├── src/
│   ├── components/
│   │   ├── chat/
│   │   │   ├── ChatToggle.tsx       # NEW: Floating toggle button
│   │   │   ├── ChatPanel.tsx        # NEW: Main chat panel
│   │   │   ├── ChatHeader.tsx       # NEW: Header with status
│   │   │   ├── ChatMessages.tsx     # NEW: Messages area
│   │   │   ├── ChatInput.tsx        # NEW: Input with send button
│   │   │   ├── QuickReplies.tsx     # NEW: Quick reply buttons
│   │   │   └── TypingIndicator.tsx  # NEW: Bouncing dots
│   │   └── ui/                      # Existing shadcn components
│   ├── lib/
│   │   ├── chat-client.ts           # NEW: Chat API client
│   │   └── auth.ts                  # Existing auth utilities
│   └── styles/
│       └── chat.css                 # NEW: Premium chat styles
└── tests/
    └── manual/
        └── phase3-chatbot-checklist.md  # NEW: Manual test checklist
```

**Structure Decision**: Web application (frontend + backend) per Phase II structure. New chatbot components added to both backend (MCP, agent, chat service) and frontend (ChatKit customization).

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         BROWSER (Next.js)                           │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │                    ChatKit UI (Customized)                     │  │
│  │  ┌─────────────┐  ┌─────────────────────────────────────────┐ │  │
│  │  │   Toggle    │  │              Chat Panel                  │ │  │
│  │  │   Button    │  │  Header | Messages | Input | QuickReply │ │  │
│  │  └─────────────┘  └─────────────────────────────────────────┘ │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                              │ JWT + Message                         │
│                              ▼                                       │
└─────────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     FASTAPI BACKEND                                  │
│  ┌─────────────────────────────────────────────────────────────────┐│
│  │                  POST /api/{user_id}/chat                        ││
│  │  1. Verify JWT  →  2. Load/Create Conversation  →  3. Store Msg ││
│  └─────────────────────────────────────────────────────────────────┘│
│                              │                                       │
│                              ▼                                       │
│  ┌─────────────────────────────────────────────────────────────────┐│
│  │                     AI AGENT (OpenAI Agents SDK)                 ││
│  │  ┌─────────────────┐    ┌────────────────────────────────────┐  ││
│  │  │ Gemini LLM      │◄──►│         MCP Tools                  │  ││
│  │  │ (OpenAI compat) │    │  add_task | list_tasks | complete  │  ││
│  │  └─────────────────┘    │  delete_task | update_task         │  ││
│  │                         └────────────────────────────────────┘  ││
│  └─────────────────────────────────────────────────────────────────┘│
│                              │                                       │
│                              ▼                                       │
│  ┌─────────────────────────────────────────────────────────────────┐│
│  │                     NEON POSTGRESQL                              ││
│  │   Tasks (existing) | Conversations (new) | Messages (new)        ││
│  └─────────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────────┘
```

---

## Implementation Phases

### Phase 0: Research & Setup ✅

Research completed - see `research.md` for findings on:
- OpenAI Agents SDK + Gemini integration pattern
- MCP SDK tool registration
- ChatKit theming capabilities

### Phase 1: Backend - Data Models & MCP Tools

**Deliverables**:
1. `Conversation` and `Message` SQLModel models
2. 5 MCP tools implementation (add_task, list_tasks, complete_task, delete_task, update_task)
3. MCP server setup
4. Unit tests for all tools

**Dependencies**: Phase II Task model, database connection

### Phase 2: Backend - Agent & Chat Endpoint

**Deliverables**:
1. Gemini client configuration (OpenAI SDK with custom base_url)
2. Todo Agent with registered MCP tools
3. Chat endpoint (`POST /api/{user_id}/chat`)
4. Chat service orchestrating conversation flow
5. Integration tests for 5 core intents

**Dependencies**: Phase 1 MCP tools, Phase II auth middleware

### Phase 3: Frontend - ChatKit Customization

**Deliverables**:
1. ChatToggle component (floating button)
2. ChatPanel with glassmorphism styling
3. ChatHeader with avatar and status
4. ChatMessages with bot/user styling
5. ChatInput with gradient send button
6. QuickReplies component
7. TypingIndicator animation
8. Chat API client with JWT

**Dependencies**: Phase 2 chat endpoint, Phase II auth session

### Phase 4: Integration & Testing

**Deliverables**:
1. End-to-end testing of all 5 intents
2. Manual test checklist completion
3. Performance validation (<5s response)
4. README updates with setup instructions

---

## Risk Analysis

| Risk | Impact | Mitigation |
|------|--------|------------|
| Gemini tool calling compatibility | High | Test early; have OpenAI fallback |
| ChatKit customization limits | Medium | Use CSS overrides; document workarounds |
| Rate limiting on free tier | Medium | Implement client-side throttling |
| Context window limits | Low | Limit conversation history to 20 messages |

---

## Environment Variables

| Variable | Purpose | Required |
|----------|---------|----------|
| `GEMINI_API_KEY` | Google Gemini API access | Yes |
| `DATABASE_URL` | Neon PostgreSQL connection | Yes (from Phase II) |
| `JWT_SECRET` | JWT token verification | Yes (from Phase II) |
| `NEXT_PUBLIC_CHAT_API_URL` | Backend chat endpoint | Yes |
| `NEXT_PUBLIC_CHATKIT_DOMAIN` | ChatKit domain allowlist | Yes |

---

## Acceptance Gates

| Gate | Criteria | Verification |
|------|----------|--------------|
| MCP Tools | All 5 tools pass unit tests | `pytest tests/unit/test_mcp_tools.py` |
| Chat Endpoint | Returns valid responses | `curl` test with JWT |
| Intent Recognition | 5 core intents work | Integration tests pass |
| UI Rendering | ChatKit panel opens/closes | Manual verification |
| End-to-End | Add→List→Complete→Delete flow | Manual test checklist |
| Performance | <5s response time | Timing measurement |

---

## Next Steps

1. Run `/sp.tasks` to generate detailed task breakdown
2. Implement Phase 1 (MCP tools) first
3. Validate Gemini tool calling before Phase 2
4. Proceed to frontend after backend is stable

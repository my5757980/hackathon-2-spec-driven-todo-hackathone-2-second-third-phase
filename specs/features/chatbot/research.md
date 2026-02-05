# Research: Todo AI Chatbot (Phase III)

**Feature**: Todo AI Chatbot
**Date**: 2026-02-03
**Status**: Complete

---

## Research Questions

### Q1: How to integrate Google Gemini with OpenAI Agents SDK?

**Decision**: Use Google's official OpenAI-compatible endpoint directly with OpenAI Python SDK

**Rationale**:
- Google provides a native OpenAI-compatible endpoint at `https://generativelanguage.googleapis.com/v1beta/openai/`
- No third-party proxy (LiteLLM) needed - simpler architecture
- Full compatibility with OpenAI Agents SDK patterns
- Supports function/tool calling required for MCP tools

**Implementation Pattern**:
```python
from openai import OpenAI

client = OpenAI(
    api_key=os.getenv("GEMINI_API_KEY"),
    base_url="https://generativelanguage.googleapis.com/v1beta/openai/"
)

# Works identically to OpenAI calls
response = client.chat.completions.create(
    model="gemini-1.5-flash",
    messages=[...],
    tools=[...]  # Function calling supported
)
```

**Alternatives Considered**:
- LiteLLM proxy: Adds complexity, another dependency
- Direct Gemini SDK: Incompatible with OpenAI Agents SDK patterns
- OpenAI API: Requires paid API key

---

### Q2: How to implement MCP tools with Official MCP SDK?

**Decision**: Use `@mcp.tool()` decorator pattern for stateless tool functions

**Rationale**:
- Official MCP SDK provides clean decorator-based registration
- Tools are stateless functions receiving all context via parameters
- Consistent JSON return format for agent parsing

**Implementation Pattern**:
```python
from mcp.server import Server
from mcp.types import Tool

server = Server("todo-mcp")

@server.tool()
async def add_task(user_id: str, title: str, description: str = "") -> dict:
    """Create a new task for the user."""
    # Database operation
    task = await create_task(user_id, title, description)
    return {
        "success": True,
        "message": f"Task '{title}' has been added.",
        "task": task.dict()
    }
```

**Alternatives Considered**:
- Custom tool implementation: More boilerplate, no standard protocol
- LangChain tools: Different pattern, not MCP compatible

---

### Q3: How to customize ChatKit UI with premium effects?

**Decision**: Use ChatKit's theming props + CSS overrides + custom wrapper components

**Rationale**:
- ChatKit provides base theming via props
- Complex effects (glassmorphism, gradients) require CSS overrides
- Custom components wrap ChatKit for additional features (toggle button, quick replies)

**Implementation Pattern**:
```tsx
// Theme configuration
<ChatKit
  primaryColor="#667eea"
  backgroundColor="rgba(26, 26, 46, 0.95)"
  borderRadius="16px"
/>

// CSS overrides for glassmorphism
.chat-panel {
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}

// Custom wrapper for toggle
<ChatToggle onClick={togglePanel}>
  <ChatKit ... />
</ChatToggle>
```

**Limitations Documented**:
- User message gradient requires CSS override (not a theme prop)
- Animations require custom CSS keyframes
- Toggle button not provided by ChatKit - must be custom

**Alternatives Considered**:
- Build chat from scratch: Significant effort, not aligned with hackathon scope
- Use different chat library: ChatKit recommended by hackathon

---

### Q4: How to persist conversation state without server-side sessions?

**Decision**: Store conversation history in PostgreSQL, load on each request

**Rationale**:
- Stateless design per constitution (Phase 3 security requirement)
- Conversation ID passed with each request
- Database persistence enables conversation continuation
- Limit loaded history to 20 messages for context window management

**Data Model**:
```
Conversation
├── id: UUID (primary key)
├── user_id: UUID (foreign key to User)
├── title: String (optional, auto-generated)
├── created_at: Timestamp
└── updated_at: Timestamp

Message
├── id: UUID (primary key)
├── conversation_id: UUID (foreign key)
├── role: Enum (user, assistant)
├── content: Text
├── tool_calls: JSON (optional)
└── created_at: Timestamp
```

**Alternatives Considered**:
- Redis session storage: Adds infrastructure, not stateless
- In-memory cache: Lost on restart, doesn't scale

---

### Q5: How to handle conversation context for pronoun resolution?

**Decision**: Pass recent message history to agent; agent uses conversation context for pronoun resolution

**Rationale**:
- LLM naturally understands pronoun references with conversation history
- No need for custom pronoun resolution code
- Limit to last 20 messages to stay within context window

**Implementation Pattern**:
```python
async def chat(user_id: str, message: str, conversation_id: str = None):
    # Load conversation history
    messages = await load_recent_messages(conversation_id, limit=20)

    # Build context for agent
    context = [{"role": m.role, "content": m.content} for m in messages]
    context.append({"role": "user", "content": message})

    # Agent handles pronoun resolution naturally
    response = await agent.run(context, tools=mcp_tools)
```

**Alternatives Considered**:
- Custom entity tracking: Complex, error-prone
- Explicit task references required: Poor UX

---

### Q6: Rate limiting strategy for free tier?

**Decision**: Implement per-user rate limiting at 60 requests/minute

**Rationale**:
- Constitution requires rate limiting for Phase 3
- 60 req/min allows normal usage without abuse
- FastAPI middleware pattern for clean implementation

**Implementation Pattern**:
```python
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_user_id_from_jwt)

@app.post("/api/{user_id}/chat")
@limiter.limit("60/minute")
async def chat_endpoint(user_id: str, request: ChatRequest):
    ...
```

**Alternatives Considered**:
- No rate limiting: Violates constitution, abuse risk
- Stricter limits: May impact normal usage

---

## Technology Decisions Summary

| Decision | Choice | Confidence |
|----------|--------|------------|
| LLM Provider | Google Gemini via OpenAI-compat endpoint | High |
| LLM Model | gemini-1.5-flash | High |
| Tool Framework | Official MCP SDK | High |
| Agent Framework | OpenAI Agents SDK | High (hackathon requirement) |
| Chat UI | OpenAI ChatKit + customization | High |
| Conversation Storage | PostgreSQL (Neon) | High |
| Rate Limiting | slowapi at 60 req/min | High |
| Context Window | 20 recent messages | Medium |

---

## Validation Checklist

- [x] Gemini OpenAI-compatible endpoint documented and tested pattern
- [x] MCP SDK tool registration pattern confirmed
- [x] ChatKit theming capabilities researched
- [x] Conversation persistence model designed
- [x] Rate limiting strategy defined
- [x] All research questions resolved

---

## References

- Google Gemini OpenAI Compatibility: https://ai.google.dev/gemini-api/docs/openai
- Official MCP SDK: https://github.com/modelcontextprotocol/python-sdk
- OpenAI Agents SDK: https://github.com/openai/agents-sdk
- OpenAI ChatKit: https://github.com/openai/chatkit
- slowapi (rate limiting): https://github.com/laurentS/slowapi

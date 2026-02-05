# Quickstart: Todo AI Chatbot (Phase III)

**Feature**: Todo AI Chatbot
**Date**: 2026-02-03
**Prerequisites**: Phase II (authentication, tasks API) must be complete

---

## Prerequisites

### Required Software

| Software | Version | Purpose |
|----------|---------|---------|
| Python | 3.13+ | Backend runtime |
| Node.js | 20+ | Frontend runtime |
| PostgreSQL | 15+ | Database (via Neon) |

### Required Accounts

| Service | Purpose | Link |
|---------|---------|------|
| Google AI Studio | Gemini API key (free) | https://aistudio.google.com/app/apikey |
| Neon | PostgreSQL database | https://neon.tech (from Phase II) |

---

## Quick Setup

### 1. Clone and Install

```bash
# Navigate to project root
cd todo-app

# Install backend dependencies
cd backend
pip install -r requirements.txt

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Environment Variables

Create/update `.env` files:

**Backend (`backend/.env`)**:
```env
# From Phase II
DATABASE_URL=postgresql://user:pass@host/db
JWT_SECRET=your-jwt-secret

# New for Phase III
GEMINI_API_KEY=your-gemini-api-key
```

**Frontend (`frontend/.env.local`)**:
```env
# From Phase II
NEXT_PUBLIC_API_URL=http://localhost:8000

# New for Phase III
NEXT_PUBLIC_CHAT_API_URL=http://localhost:8000/api
```

### 3. Database Migration

```bash
cd backend

# Run migrations (creates conversations and messages tables)
alembic upgrade head
```

### 4. Start Services

**Terminal 1 - Backend**:
```bash
cd backend
uvicorn src.main:app --reload --port 8000
```

**Terminal 2 - Frontend**:
```bash
cd frontend
npm run dev
```

### 5. Verify Setup

```bash
# Test chat endpoint (replace with valid JWT)
curl -X POST http://localhost:8000/api/your-user-id/chat \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello, what can you do?"}'
```

Expected response:
```json
{
  "response": "I can help you add, list, complete, update, or delete tasks. What would you like to do?",
  "conversation_id": "...",
  "tool_calls": []
}
```

---

## Testing the Chatbot

### Basic Commands to Try

| Say This | Expected Result |
|----------|-----------------|
| "Add a task to buy groceries" | Creates task, confirms |
| "Show my tasks" | Lists all tasks |
| "Mark buy groceries as done" | Completes the task |
| "Delete buy groceries" | Removes the task |
| "Rename task X to Y" | Updates task title |

### Multi-Turn Conversation Test

```
You: Add a task to buy milk
Bot: Task 'buy milk' has been added.

You: Actually, delete it
Bot: Task 'buy milk' has been deleted.
```

---

## Project Structure Overview

```
todo-app/
├── backend/
│   ├── src/
│   │   ├── models/
│   │   │   ├── conversation.py  # NEW
│   │   │   └── message.py       # NEW
│   │   ├── mcp/
│   │   │   └── tools/           # NEW: 5 MCP tools
│   │   ├── agent/
│   │   │   └── todo_agent.py    # NEW: AI agent
│   │   └── api/
│   │       └── routes/
│   │           └── chat.py      # NEW: Chat endpoint
│   └── tests/
│       └── integration/
│           └── test_chatbot_intents.py  # NEW
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── chat/            # NEW: ChatKit components
│   │   └── lib/
│   │       └── chat-client.ts   # NEW: Chat API client
│   └── styles/
│       └── chat.css             # NEW: Premium styles
│
└── specs/
    ├── features/chatbot/        # Specifications
    ├── api/mcp-tools.md
    ├── agent/agent-behavior.md
    └── ui/chatkit.md
```

---

## Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| "GEMINI_API_KEY not found" | Check `.env` file in backend directory |
| 401 Unauthorized | Verify JWT token is valid and not expired |
| "Conversation not found" | Make sure conversation_id is valid or omit for new conversation |
| Chat panel not opening | Check browser console for JavaScript errors |
| Slow responses (>10s) | Check Gemini API status; may be rate limited |

### Verify Gemini Connection

```python
# Run in Python REPL
from openai import OpenAI
import os

client = OpenAI(
    api_key=os.getenv("GEMINI_API_KEY"),
    base_url="https://generativelanguage.googleapis.com/v1beta/openai/"
)

response = client.chat.completions.create(
    model="gemini-1.5-flash",
    messages=[{"role": "user", "content": "Hello"}]
)
print(response.choices[0].message.content)
```

### Check Database Tables

```sql
-- Verify tables exist
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('conversations', 'messages');

-- Should return:
-- conversations
-- messages
```

---

## Next Steps

1. **Run Tests**: `pytest tests/integration/test_chatbot_intents.py`
2. **Complete Manual Checklist**: `tests/manual/phase3-chatbot-checklist.md`
3. **Deploy**: Follow Phase IV deployment guide when ready

---

## Resources

- [Main Feature Spec](spec.md)
- [MCP Tools Spec](../../api/mcp-tools.md)
- [Agent Behavior Spec](../../agent/agent-behavior.md)
- [ChatKit UI Spec](../../ui/chatkit.md)
- [Google AI Studio](https://aistudio.google.com)

---
name: hackathon-phase3-agent-chat-builder
description: Use this skill when building or debugging the Panaversity Hackathon Phase III Todo AI Chatbot backend. It generates FastAPI chat endpoints with JWT auth, SQLModel conversation/message schemas, OpenAI Agents SDK setup with Gemini integration, conversation history management, and agent behavior logic following your specs. Best for creating new chat routes, fixing agent responses, building database models, implementing conversation flows, or integrating MCP tools with Gemini.
version: 1.0.0
author: Panaversity Hackathon Team
tags:
  - fastapi
  - chatbot
  - openai-agents-sdk
  - gemini
  - jwt-auth
  - sqlmodel
  - conversation-management
  - mcp-tools
  - backend
  - ai-agent
---

# Hackathon Phase III Agent Chat Builder

## Overview

This skill enables rapid development and debugging of the Panaversity Hackathon Phase III Todo AI Chatbot backend. It provides comprehensive templates and patterns for building FastAPI chat endpoints with JWT authentication, SQLModel database schemas, OpenAI Agents SDK integration with Gemini, conversation history management, and agent behavior logic.

## When to Use This Skill

Use this skill when you need to:

- Create new chat API endpoints with proper authentication
- Build or modify database models for conversations and messages
- Set up OpenAI Agents SDK with Gemini API integration
- Implement conversation history loading and saving
- Debug agent response logic and behavior
- Add confirmation flows for destructive actions
- Integrate MCP tools with the Gemini agent
- Fix pronoun resolution or intent detection issues
- Structure backend code following project conventions

## Workflow

1. **Reference Specifications**: Always start by reviewing `@specs/features/chatbot/spec.md` and `@specs/agent/agent-behavior.md` to understand current requirements and constraints.

2. **Identify Task Type**: Determine which component needs work (endpoint, models, agent setup, history management, behavior logic).

3. **Retrieve Template**: Select and generate the appropriate script or asset based on the task at hand.

4. **Customize Details**: Inject user-specific information such as `user_id`, `conversation_id`, tool configurations, and environment variables.

5. **Configure Gemini Integration**: Insert OpenAI-compatible Gemini client setup with proper base URL and API key management.

6. **Add Authentication & Database**: Implement JWT auth middleware and async database operations with proper session management.

7. **Apply Behavior Rules**: Incorporate agent behavior logic including intent mapping, confirmation workflows, error handling, and pronoun resolution.

8. **Suggest File Structure**: Provide recommended file paths within the `backend/src/` directory structure.

9. **Break Down Complexity**: For multi-step tasks, outline incremental steps and confirm understanding before proceeding.

## Scripts

### 1. FastAPI Chat Endpoint Template

```python
# backend/src/api/routes/chat.py

from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from typing import Optional
import os
from datetime import datetime

from ...core.auth import get_current_user
from ...core.database import get_session
from ...models.conversation import Conversation, Message
from ...services.agent_service import AgentService
from ...services.conversation_service import ConversationService
from ...schemas.chat import ChatRequest, ChatResponse

router = APIRouter(prefix="/chat", tags=["chat"])

@router.post("/message", response_model=ChatResponse)
async def send_message(
    request: ChatRequest,
    current_user: dict = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Send a message to the AI agent and receive a response.
    Handles conversation creation, history loading, and message persistence.
    """
    try:
        user_id = current_user["user_id"]
        conversation_service = ConversationService(session)
        agent_service = AgentService()
        
        # Get or create conversation
        if request.conversation_id:
            conversation = session.get(Conversation, request.conversation_id)
            if not conversation or conversation.user_id != user_
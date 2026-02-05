# Generated from @specs/features/chatbot/spec.md
"""AI Agent module for Todo AI Chatbot.

This module provides the AI agent functionality using OpenAI Agents SDK
with Google Gemini as the LLM provider.
"""

from .config import get_gemini_client
from .todo_agent import TodoAgent

__all__ = ["get_gemini_client", "TodoAgent"]

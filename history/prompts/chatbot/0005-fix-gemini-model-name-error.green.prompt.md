---
id: "0005"
title: Fix Gemini model name error
stage: green
date: 2026-02-05
surface: agent
model: claude-opus-4-5-20251101
feature: chatbot
branch: 004-todo-ai-chatbot
user: maira
command: /sp.implement
labels: ["gemini", "openai-sdk", "bugfix", "config"]
links:
  spec: "@specs/features/chatbot/spec.md"
  ticket: null
  adr: null
  pr: null
files:
  - backend/agent/config.py
tests:
  - null
---

## Prompt

Fix Gemini model name error in Phase III Todo AI Chatbot

Current problem: When calling Gemini via OpenAI-compatible endpoint, getting 404 error:
"models/gemini-1.5-flash is not found for API version v1main, or is not supported for generateContent."

File: backend/agent/config.py (or wherever GEMINI_MODEL is defined)
Current code:
GEMINI_MODEL = "gemini-1.5-flash"

Fix needed:
- Change model name to correct format for Google's OpenAI-compatible endpoint
- Use one of these working names (latest as of 2026):
  - "models/gemini-1.5-flash-latest" (recommended)
  - "models/gemini-1.5-flash"
  - "models/gemini-1.5-flash-002" (stable version)
- Keep base_url unchanged: "https://generativelanguage.googleapis.com/v1beta/openai/"
- Do not use any google-generativeai import or genai module (we are using OpenAI SDK only)
- Add a comment explaining the prefix requirement
- Ensure get_model_name() returns the updated value
- No other changes in the file

Generate the updated version of the full config.py file (or just the relevant part if small)
After fix, server should start without import errors and Gemini calls should succeed without 404.

Reference: Google Gemini OpenAI-compatible docs require "models/" prefix for model names in this endpoint.

## Response snapshot

Fixed `backend/agent/config.py` with two key changes:

1. **Replaced `google.genai` SDK with OpenAI SDK**: Changed from `from google import genai` to `from openai import AsyncOpenAI`. The agent code (`todo_agent.py`) was already using `AsyncOpenAI` types, but the config was returning incompatible `genai.Client`.

2. **Added "models/" prefix to model name**: Changed `GEMINI_MODEL = "gemini-2.0-flash"` to `GEMINI_MODEL = "models/gemini-2.0-flash"`. Added inline comment explaining this requirement.

3. **Configured OpenAI client for Gemini endpoint**: `get_gemini_client()` now returns `AsyncOpenAI` configured with:
   - `api_key` from `GEMINI_API_KEY` env var
   - `base_url` = `"https://generativelanguage.googleapis.com/v1beta/openai/"`

## Outcome

- ✅ Impact: Fixed import mismatch and model name format error preventing Gemini API calls
- 🧪 Tests: No automated tests; manual verification needed by starting server
- 📁 Files: 1 file modified (backend/agent/config.py)
- 🔁 Next prompts: Test chatbot endpoint with actual Gemini API calls
- 🧠 Reflection: The original config was mixing SDKs - using google.genai but the agent code expected OpenAI SDK. The fix aligns both to use OpenAI SDK with Gemini's compatibility layer.

## Evaluation notes (flywheel)

- Failure modes observed: SDK mismatch (genai vs openai), missing "models/" prefix in model name
- Graders run and results (PASS/FAIL): N/A (manual verification needed)
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): Test with actual API call to verify model name works

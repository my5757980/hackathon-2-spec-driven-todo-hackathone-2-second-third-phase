# Generated from @specs/features/chatbot/spec.md
"""Gemini client configuration module.

Configures the OpenAI SDK to use Google's Gemini API via OpenAI-compatible endpoint.
See: https://ai.google.dev/gemini-api/docs/openai
"""

import os
from openai import AsyncOpenAI


# Gemini OpenAI-compatible endpoint base URL
GEMINI_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/openai/"

# Gemini model configuration
# IMPORTANT: When using Gemini's OpenAI-compatible endpoint, model names must
# include the "models/" prefix (e.g., "models/gemini-2.0-flash").
# Without this prefix, you'll get a 404 error.
# GEMINI_MODEL = "models/gemini-2.0-flash"
# GEMINI_MODEL = "models/gemini-1.5-flash-latest"
# GEMINI_MODEL = "models/gemini-1.5-flash-002"
GEMINI_MODEL = "gemini-2.5-flash"


def get_gemini_client() -> AsyncOpenAI:
    """Get an AsyncOpenAI client configured for Gemini.

    Creates an OpenAI SDK client pointing to Google's Gemini OpenAI-compatible endpoint.
    This allows using Gemini with the OpenAI Agents SDK.

    Returns:
        AsyncOpenAI: Configured client for Gemini API via OpenAI-compatible endpoint.

    Raises:
        RuntimeError: If GEMINI_API_KEY is not set.
    """
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise RuntimeError(
            "GEMINI_API_KEY environment variable is not set. "
            "Get your free API key from https://aistudio.google.com/app/apikey"
        )

    print(f"[Gemini Config] Creating AsyncOpenAI client with model: {GEMINI_MODEL}")
    print(f"[Gemini Config] Using base URL: {GEMINI_BASE_URL}")

    return AsyncOpenAI(
        api_key=api_key,
        base_url=GEMINI_BASE_URL,
    )


def get_model_name() -> str:
    """Get the Gemini model name to use.

    Returns:
        str: The model identifier for Gemini (includes "models/" prefix).
    """
    return os.getenv("GEMINI_MODEL", GEMINI_MODEL)

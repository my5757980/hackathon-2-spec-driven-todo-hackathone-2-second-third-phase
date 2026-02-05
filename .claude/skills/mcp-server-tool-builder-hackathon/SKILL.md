---
name: mcp-server-tool-builder-hackathon
description: Use this skill when building MCP tools and servers for Panaversity Hackathon Phase III Todo AI Chatbot. It generates spec-compliant async Python code using FastMCP, SQLModel for Neon DB, and Gemini via OpenAI-compatible endpoint. Handles tool generation, server setup, debugging, and ensures exact adherence to project specs with proper file structure and error handling.
version: 1.0.0
dependencies:
  - fastmcp
  - sqlmodel
  - openai
  - fastapi
tags:
  - mcp
  - hackathon
  - python
  - fastapi
  - sqlmodel
  - gemini
  - code-generation
---

# MCP Server Tool Builder - Hackathon

## Purpose

Build spec-compliant MCP tools and servers for the Panaversity Hackathon Phase III Todo AI Chatbot project. This skill ensures all generated code follows exact specifications from `@specs/api/mcp-tools.md`, implements proper async patterns with FastMCP, integrates SQLModel for Neon DB operations, and configures Gemini via OpenAI-compatible endpoints.

## Workflow

1. **Analyze Requirements**: Reference `@specs/api/mcp-tools.md` to extract exact tool specifications including parameters, return schemas, error handling patterns, and business logic requirements
2. **Generate Tool Code**: Create async Python functions decorated with FastMCP that implement the specified functionality with proper user_id filtering and SQLModel queries
3. **Validate Return Format**: Ensure exact JSON return format matching specs with required fields (success, message, task/tasks) and proper error handling
4. **Structure Files**: Suggest proper file paths under `backend/src/mcp/` and generate necessary `__init__.py` files for package structure
5. **Build Server Setup**: When needed, generate complete MCP server configuration including FastAPI mounting at `/mcp`, FastMCP initialization, and Gemini OpenAI client setup
6. **Debug & Fix**: Analyze existing code against specs, identify deviations, and output corrected versions with explanations

## Scripts

### MCP Tool Code Generator

**Purpose**: Generate complete async Python code for a single MCP tool

**Input**:
- Tool name (e.g., "get_task_by_title", "mark_task_complete")
- Spec reference or requirements description

**Output**:
- Complete Python function with:
  - Proper imports (FastMCP, SQLModel, OpenAI, typing)
  - FastMCP decorator with tool metadata
  - Async function signature with user_id parameter
  - SQLModel database queries with user_id filtering
  - Error handling for common cases
  - Exact JSON return format matching specs
  - Comprehensive docstring

**Usage Pattern**:
```
Generate MCP tool code for [tool_name] that [requirements]. 
Reference: @specs/api/mcp-tools.md section [X]
```

### MCP Server Builder

**Purpose**: Generate complete MCP server setup with all integrations

**Input**:
- List of tools to include
- Server configuration requirements

**Output**:
- Complete server file with:
  - FastAPI application setup
  - FastMCP instance initialization
  - Gemini OpenAI client configuration
  - All tool imports and registrations
  - Server mounting at `/mcp` endpoint
  - Environment variable handling
  - Proper async context management

**Usage Pattern**:
```
Build complete MCP server including tools: [tool1, tool2, tool3]
with Gemini integration and FastAPI mounting
```

### Tool Validator & Fixer

**Purpose**: Analyze and correct MCP tool code against specifications

**Input**:
- Existing tool code (as file path or code block)
- Specification reference

**Output**:
- Analysis report identifying:
  - Deviations from spec (return format, parameters, logic)
  - Missing error handling
  - Incorrect database queries
  - Type annotation issues
- Corrected code version
- Explanation of all changes made

**Usage Pattern**:
```
Validate this MCP tool code against specs and fix any issues:
[code or file path]
```

### Spec-to-Code Mapper

**Purpose**: Parse
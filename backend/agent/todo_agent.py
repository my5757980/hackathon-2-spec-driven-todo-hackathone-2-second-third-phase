# Generated from @specs/agent/agent-behavior.md
"""Todo Agent implementation.

AI agent that interprets natural language and calls MCP tools for task management.
Uses OpenAI Agents SDK with Google Gemini as the LLM provider.
"""

import json
from typing import Optional, Any

from openai import AsyncOpenAI
from sqlalchemy.ext.asyncio import AsyncSession

from .config import get_gemini_client, get_model_name
from mcp.tools import (
    add_task,
    list_tasks,
    complete_task,
    delete_task,
    update_task,
    get_all_tools,
)


# System prompt defining agent behavior per agent-behavior.md
SYSTEM_PROMPT = """You are a helpful Todo assistant that helps users manage their tasks through natural language conversation.

## Your Capabilities
You can help users:
- Add new tasks ("add a task...", "create a task...", "I need to...", "remind me to...")
- List their tasks ("show my tasks", "what are my todos", "what do I need to do")
- Mark tasks complete ("mark ... as done", "complete ...", "I finished ...")
- Delete tasks ("delete ...", "remove ...", "cancel ...")
- Update task titles ("rename ... to ...", "change ... to ...", "update ...")

## Response Guidelines
1. Always confirm actions: Include the task title in confirmations so users know which task was affected
2. Be conversational but concise: Keep responses brief and friendly
3. Handle errors gracefully: When tasks aren't found, suggest alternatives
4. Resolve ambiguity: When multiple tasks match, list them and ask which one the user meant
5. Unknown intent: If you can't determine what the user wants, explain your capabilities

## Tool Usage
- ALWAYS use the provided tools to perform actions - never pretend to do actions
- The user_id parameter will be provided to you for each request
- Use title_match for natural language task references
- Use task_id only when you have a specific ID from previous tool results

## Pronoun Resolution
When the user uses pronouns like "it", "that", "the first one":
- "it" / "that" typically refers to the most recently mentioned task
- "the first one", "number 1" refers to the first task in a recently listed set
- If unclear, ask for clarification

## Response Tone
- Use friendly, conversational language
- Say "Got it!" not "Request processed successfully"
- Say "I couldn't find that task" not "Error: Task not found"
- Celebrate completions: "Nice work!" for completed tasks
"""


class TodoAgent:
    """AI agent for Todo task management.

    Interprets natural language, calls appropriate MCP tools,
    and generates natural language responses.
    """

    def __init__(self, user_id: str):
        """Initialize the agent.

        Args:
            user_id: The authenticated user's ID for all tool calls.
        """
        self.user_id = user_id
        self.client: AsyncOpenAI = get_gemini_client()
        self.model = get_model_name()
        self.tools = get_all_tools()
        self.conversation_history: list[dict[str, Any]] = []

    async def process_message(
        self,
        message: str,
        session: AsyncSession,
        conversation_history: Optional[list[dict[str, Any]]] = None,
    ) -> dict[str, Any]:
        """Process a user message and return an agent response.

        Args:
            message: The user's natural language message.
            session: Database session for tool execution.
            conversation_history: Optional previous conversation for context.

        Returns:
            dict: Response containing the assistant's message and any tool calls.
        """
        # Build messages with system prompt and history
        messages = [{"role": "system", "content": SYSTEM_PROMPT}]

        # Add conversation history for context
        if conversation_history:
            messages.extend(conversation_history[-20:])  # Limit to last 20 messages

        # Add current user message
        messages.append({"role": "user", "content": message})

        # Track tool calls for response
        tool_calls_made: list[dict[str, Any]] = []

        try:
            # Initial API call with tools
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                tools=self.tools,
                tool_choice="auto",
            )

            assistant_message = response.choices[0].message

            # Process tool calls if any
            while assistant_message.tool_calls:
                # Add assistant message with tool calls to history
                messages.append({
                    "role": "assistant",
                    "content": assistant_message.content or "",
                    "tool_calls": [
                        {
                            "id": tc.id,
                            "type": "function",
                            "function": {
                                "name": tc.function.name,
                                "arguments": tc.function.arguments,
                            },
                        }
                        for tc in assistant_message.tool_calls
                    ],
                })

                # Execute each tool call
                for tool_call in assistant_message.tool_calls:
                    tool_name = tool_call.function.name
                    tool_args = json.loads(tool_call.function.arguments)

                    # Always inject user_id for security
                    tool_args["user_id"] = self.user_id

                    # Execute the appropriate tool
                    tool_result = await self._execute_tool(
                        tool_name, tool_args, session
                    )

                    # Track the tool call
                    tool_calls_made.append({
                        "tool": tool_name,
                        "arguments": tool_args,
                        "result": tool_result,
                    })

                    # Add tool result to messages
                    messages.append({
                        "role": "tool",
                        "tool_call_id": tool_call.id,
                        "content": json.dumps(tool_result),
                    })

                # Get next response after tool execution
                response = await self.client.chat.completions.create(
                    model=self.model,
                    messages=messages,
                    tools=self.tools,
                    tool_choice="auto",
                )

                assistant_message = response.choices[0].message

            # Return final response
            return {
                "response": assistant_message.content or "I'm not sure how to help with that.",
                "tool_calls": tool_calls_made if tool_calls_made else None,
            }

        except Exception as e:
            print(f"[Agent] Error processing message: {e}")
            return {
                "response": "I encountered an error while processing your request. Please try again.",
                "error": str(e),
            }

    async def _execute_tool(
        self,
        tool_name: str,
        tool_args: dict[str, Any],
        session: AsyncSession,
    ) -> dict[str, Any]:
        """Execute an MCP tool and return the result.

        Args:
            tool_name: Name of the tool to execute.
            tool_args: Arguments for the tool.
            session: Database session.

        Returns:
            dict: Tool execution result.
        """
        try:
            if tool_name == "add_task":
                return await add_task(
                    session=session,
                    user_id=tool_args["user_id"],
                    title=tool_args.get("title", ""),
                    description=tool_args.get("description"),
                )
            elif tool_name == "list_tasks":
                return await list_tasks(
                    session=session,
                    user_id=tool_args["user_id"],
                    status=tool_args.get("status", "all"),
                )
            elif tool_name == "complete_task":
                return await complete_task(
                    session=session,
                    user_id=tool_args["user_id"],
                    task_id=tool_args.get("task_id"),
                    title_match=tool_args.get("title_match"),
                )
            elif tool_name == "delete_task":
                return await delete_task(
                    session=session,
                    user_id=tool_args["user_id"],
                    task_id=tool_args.get("task_id"),
                    title_match=tool_args.get("title_match"),
                )
            elif tool_name == "update_task":
                return await update_task(
                    session=session,
                    user_id=tool_args["user_id"],
                    task_id=tool_args.get("task_id"),
                    title_match=tool_args.get("title_match"),
                    new_title=tool_args.get("new_title"),
                    new_description=tool_args.get("new_description"),
                )
            else:
                return {
                    "success": False,
                    "error": "unknown_tool",
                    "message": f"Unknown tool: {tool_name}",
                }
        except Exception as e:
            print(f"[Agent] Tool execution error ({tool_name}): {e}")
            return {
                "success": False,
                "error": "tool_execution_error",
                "message": f"Failed to execute {tool_name}: {str(e)}",
            }

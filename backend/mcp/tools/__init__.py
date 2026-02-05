# Generated from @specs/api/mcp-tools.md
"""MCP Tools for Todo task management.

Exports all 5 MCP tools:
- add_task: Create a new task
- list_tasks: Retrieve user's tasks
- complete_task: Mark a task as complete
- delete_task: Remove a task
- update_task: Update task title/description
"""

from .add_task import add_task
from .list_tasks import list_tasks
from .complete_task import complete_task
from .delete_task import delete_task
from .update_task import update_task


def get_all_tools() -> list:
    """Get all MCP tool definitions for agent registration.

    Returns:
        list: List of tool definition dictionaries for OpenAI function calling.
    """
    return [
        {
            "type": "function",
            "function": {
                "name": "add_task",
                "description": "Create a new task for the user",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "user_id": {
                            "type": "string",
                            "description": "The authenticated user's ID",
                        },
                        "title": {
                            "type": "string",
                            "description": "The title/name of the task",
                        },
                        "description": {
                            "type": "string",
                            "description": "Optional detailed description of the task",
                        },
                    },
                    "required": ["user_id", "title"],
                },
            },
        },
        {
            "type": "function",
            "function": {
                "name": "list_tasks",
                "description": "Retrieve all tasks belonging to the user",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "user_id": {
                            "type": "string",
                            "description": "The authenticated user's ID",
                        },
                        "status": {
                            "type": "string",
                            "enum": ["all", "pending", "completed"],
                            "description": "Filter by status: all, pending, or completed",
                        },
                    },
                    "required": ["user_id"],
                },
            },
        },
        {
            "type": "function",
            "function": {
                "name": "complete_task",
                "description": "Mark a specific task as complete",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "user_id": {
                            "type": "string",
                            "description": "The authenticated user's ID",
                        },
                        "task_id": {
                            "type": "string",
                            "description": "The specific task ID (if known)",
                        },
                        "title_match": {
                            "type": "string",
                            "description": "Partial title to match (if task_id not provided)",
                        },
                    },
                    "required": ["user_id"],
                },
            },
        },
        {
            "type": "function",
            "function": {
                "name": "delete_task",
                "description": "Remove a specific task permanently",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "user_id": {
                            "type": "string",
                            "description": "The authenticated user's ID",
                        },
                        "task_id": {
                            "type": "string",
                            "description": "The specific task ID (if known)",
                        },
                        "title_match": {
                            "type": "string",
                            "description": "Partial title to match (if task_id not provided)",
                        },
                    },
                    "required": ["user_id"],
                },
            },
        },
        {
            "type": "function",
            "function": {
                "name": "update_task",
                "description": "Update a task's title and/or description",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "user_id": {
                            "type": "string",
                            "description": "The authenticated user's ID",
                        },
                        "task_id": {
                            "type": "string",
                            "description": "The specific task ID (if known)",
                        },
                        "title_match": {
                            "type": "string",
                            "description": "Partial title to match (if task_id not provided)",
                        },
                        "new_title": {
                            "type": "string",
                            "description": "The new title for the task",
                        },
                        "new_description": {
                            "type": "string",
                            "description": "The new description for the task",
                        },
                    },
                    "required": ["user_id"],
                },
            },
        },
    ]


__all__ = [
    "add_task",
    "list_tasks",
    "complete_task",
    "delete_task",
    "update_task",
    "get_all_tools",
]

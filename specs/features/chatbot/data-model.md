# Data Model: Todo AI Chatbot (Phase III)

**Feature**: Todo AI Chatbot
**Date**: 2026-02-03
**Status**: Draft

---

## Overview

This document defines the new data models required for Phase III chatbot functionality. These models extend the existing Phase II schema without modifying existing tables.

---

## Entity Relationship Diagram

```
┌─────────────────────┐
│        User         │  (Existing from Phase II)
│─────────────────────│
│ id: UUID (PK)       │
│ email: String       │
│ name: String        │
│ ...                 │
└─────────┬───────────┘
          │
          │ 1:N
          │
          ▼
┌─────────────────────┐         ┌─────────────────────┐
│    Conversation     │         │        Task         │  (Existing from Phase II)
│─────────────────────│         │─────────────────────│
│ id: UUID (PK)       │         │ id: UUID (PK)       │
│ user_id: UUID (FK)  │         │ user_id: UUID (FK)  │
│ title: String?      │         │ title: String       │
│ created_at: DateTime│         │ description: String?│
│ updated_at: DateTime│         │ completed: Boolean  │
└─────────┬───────────┘         │ created_at: DateTime│
          │                     │ updated_at: DateTime│
          │ 1:N                 └─────────────────────┘
          │
          ▼
┌─────────────────────┐
│      Message        │
│─────────────────────│
│ id: UUID (PK)       │
│ conversation_id: UUID (FK)
│ role: Enum          │
│ content: Text       │
│ tool_calls: JSON?   │
│ created_at: DateTime│
└─────────────────────┘
```

---

## New Entities

### Conversation

Represents a chat session between a user and the AI assistant.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique conversation identifier |
| user_id | UUID | FOREIGN KEY (users.id), NOT NULL | Owner of the conversation |
| title | String(255) | NULLABLE | Auto-generated or user-set title |
| created_at | DateTime | NOT NULL, DEFAULT NOW() | When conversation started |
| updated_at | DateTime | NOT NULL, DEFAULT NOW() | Last activity timestamp |

**Indexes**:
- `idx_conversation_user_id` on `user_id` - for listing user's conversations
- `idx_conversation_updated_at` on `updated_at` - for sorting by recency

**Relationships**:
- `user`: Many-to-One with User
- `messages`: One-to-Many with Message

---

### Message

Represents a single message in a conversation.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique message identifier |
| conversation_id | UUID | FOREIGN KEY (conversations.id), NOT NULL | Parent conversation |
| role | Enum('user', 'assistant') | NOT NULL | Who sent the message |
| content | Text | NOT NULL | Message text content |
| tool_calls | JSON | NULLABLE | Tools called by assistant (if any) |
| created_at | DateTime | NOT NULL, DEFAULT NOW() | When message was sent |

**Indexes**:
- `idx_message_conversation_id` on `conversation_id` - for loading conversation messages
- `idx_message_created_at` on `created_at` - for chronological ordering

**Relationships**:
- `conversation`: Many-to-One with Conversation

---

## Existing Entities (Phase II - No Changes)

### Task

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Unique task identifier |
| user_id | UUID | Owner of the task |
| title | String(200) | Task title/name |
| description | Text | Optional detailed description |
| completed | Boolean | Completion status |
| created_at | DateTime | Creation timestamp |
| updated_at | DateTime | Last modification timestamp |

**Note**: MCP tools interact with this existing model. No modifications required.

---

## SQLModel Definitions

### Conversation Model

```python
from sqlmodel import SQLModel, Field, Relationship
from datetime import datetime
from uuid import UUID, uuid4
from typing import Optional, List

class Conversation(SQLModel, table=True):
    __tablename__ = "conversations"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    user_id: UUID = Field(foreign_key="users.id", index=True)
    title: Optional[str] = Field(default=None, max_length=255)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationships
    messages: List["Message"] = Relationship(back_populates="conversation")
```

### Message Model

```python
from enum import Enum

class MessageRole(str, Enum):
    user = "user"
    assistant = "assistant"

class Message(SQLModel, table=True):
    __tablename__ = "messages"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    conversation_id: UUID = Field(foreign_key="conversations.id", index=True)
    role: MessageRole = Field(...)
    content: str = Field(...)
    tool_calls: Optional[dict] = Field(default=None, sa_column_kwargs={"type_": JSON})
    created_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationships
    conversation: Conversation = Relationship(back_populates="messages")
```

---

## Validation Rules

### Conversation

| Rule | Validation |
|------|------------|
| user_id must exist | Foreign key constraint |
| title max length | 255 characters |
| updated_at >= created_at | Application logic |

### Message

| Rule | Validation |
|------|------------|
| conversation_id must exist | Foreign key constraint |
| role must be valid enum | Enum constraint |
| content cannot be empty | Application validation |
| tool_calls must be valid JSON | JSON column type |

---

## State Transitions

### Conversation Lifecycle

```
Created → Active → Archived (future)
   │         │
   │         └── updated_at refreshed on each message
   │
   └── created with first user message
```

### Message States

Messages are immutable after creation. No state transitions.

---

## Query Patterns

### Load Conversation with Recent Messages

```sql
SELECT c.*, m.*
FROM conversations c
LEFT JOIN messages m ON m.conversation_id = c.id
WHERE c.id = :conversation_id
  AND c.user_id = :user_id
ORDER BY m.created_at DESC
LIMIT 20;
```

### List User's Conversations

```sql
SELECT c.id, c.title, c.updated_at,
       (SELECT content FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message
FROM conversations c
WHERE c.user_id = :user_id
ORDER BY c.updated_at DESC
LIMIT 50;
```

### Count User's Messages Today (for rate limiting context)

```sql
SELECT COUNT(*)
FROM messages m
JOIN conversations c ON m.conversation_id = c.id
WHERE c.user_id = :user_id
  AND m.created_at >= CURRENT_DATE;
```

---

## Migration Notes

1. **New Tables**: `conversations` and `messages` tables are additive
2. **No Breaking Changes**: Existing `users` and `tasks` tables unchanged
3. **Cascade Delete**: When user deleted, cascade to conversations and messages
4. **Index Strategy**: Indexes on foreign keys and common query patterns

---

## Data Retention

| Data Type | Retention Policy |
|-----------|------------------|
| Conversations | Indefinite (user-owned) |
| Messages | Indefinite (part of conversation) |

**Future Consideration**: Implement conversation archival/deletion for storage management.

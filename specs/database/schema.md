# Feature Specification: Database Schema for Multi-User Todo App

**Feature Branch**: `001-authentication` (Phase 2)
**Created**: 2026-01-19
**Updated**: 2026-01-26
**Status**: Draft
**Input**: Database schema for Neon Serverless PostgreSQL supporting task-crud with user isolation

## Changes Summary (2026-01-26)

- Added "Better Auth Tables" section with complete SQL schemas for user, session, account, verification tables
- Added "JWT Mode Configuration" section (recommend HS256, avoid JWKS table errors)
- Added "Database Adapter Setup" section (pg Pool for frontend, SQLModel for backend)
- Added "Table Creation / Migration Process" section with migration strategies
- Added "JWKS Table (Optional)" section explaining when/why to avoid JWKS mode
- Updated timestamps to use `TIMESTAMP WITH TIME ZONE` for timezone-aware storage
- Clarified ON DELETE CASCADE behavior for all foreign keys
- Added "Better Auth User Table Integration" section explaining how Better Auth manages user schema
- Updated Assumptions with implementation-specific details
- Updated Success Criteria with implementation-readiness checks
- Added "Implementation Checklist" for pre-deployment verification

---

## Clarifications

### Session 2026-01-19

- Q: How should the system handle concurrent updates to the same task? → A: Last-write-wins (no conflict detection) - simple overwrites; updated_at reflects latest write
- Q: How should individual task deletion work? → A: Hard delete - task row is permanently removed from database

### Session 2026-01-26

- Q: Which JWT algorithm should Better Auth use? → A: HS256 with shared secret (`BETTER_AUTH_SECRET`); avoids JWKS table requirement
- Q: How should the database adapter be configured? → A: Use pg Pool adapter on frontend for Better Auth; SQLModel/SQLAlchemy on backend for tasks
- Q: Should timestamps be timezone-aware? → A: Yes, use `TIMESTAMP WITH TIME ZONE` for all datetime fields
- Q: Does Better Auth auto-create tables? → A: No automatic migration; tables must be created manually or via migration tool before first signup

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Task Data Persistence (Priority: P1)

A registered user creates, reads, updates, and deletes their tasks, with all changes persisted across sessions in the database. Each user's tasks remain isolated from other users.

**Why this priority**: Core functionality - without persistent storage, tasks are lost on app restart. User isolation is fundamental to multi-user support.

**Independent Test**: Can be fully tested by creating a task, closing the application, reopening, and verifying the task persists. Another user logged in should not see this task.

**Acceptance Scenarios**:

1. **Given** a registered user with an existing task, **When** they close and reopen the app, **Then** the task is still visible with all its data intact
2. **Given** User A creates a task, **When** User B logs in, **Then** User B cannot see User A's tasks
3. **Given** a user creates a task with title and description, **When** they retrieve the task, **Then** all fields (title, description, completed, timestamps) are correctly stored

---

### User Story 2 - Task Completion Status Tracking (Priority: P1)

Users can mark tasks as complete or incomplete, with the status persisted in the database and queryable for filtering.

**Why this priority**: Essential for task management - users must track what's done vs pending.

**Independent Test**: Mark a task complete, refresh the page, verify status persists. Filter by completed status and verify correct results.

**Acceptance Scenarios**:

1. **Given** a user marks a task as completed, **When** they refresh the page, **Then** the task still shows as completed
2. **Given** multiple tasks with mixed completion status, **When** filtering by completed=true, **Then** only completed tasks are returned
3. **Given** a user changes a task from complete to incomplete, **When** they query the task, **Then** the updated status is persisted

---

### User Story 3 - User Account Storage (Priority: P1)

User accounts created via Better Auth are persisted with unique identifiers and email addresses, enabling task ownership assignment.

**Why this priority**: Foundation for user isolation - tasks must be linked to user accounts.

**Independent Test**: Register a new user, verify user record exists in database with correct email and unique ID.

**Acceptance Scenarios**:

1. **Given** a new user registers via Better Auth, **When** the registration completes, **Then** a user record exists with a unique ID and their email
2. **Given** an existing user, **When** they log in, **Then** their user ID can be used to query their tasks
3. **Given** two users, **When** both register, **Then** they have distinct user IDs and neither can have duplicate emails

---

### User Story 4 - Task Ownership Query Performance (Priority: P2)

Queries filtering tasks by user ownership (user_id) execute efficiently even with large datasets.

**Why this priority**: Performance requirement - slow queries degrade user experience as data grows.

**Independent Test**: Load test with 10,000+ tasks across multiple users; verify user-specific queries return within acceptable time.

**Acceptance Scenarios**:

1. **Given** a database with 10,000 tasks distributed across 100 users, **When** querying tasks for a single user, **Then** results return in under 100ms
2. **Given** proper indexing on user_id, **When** running an EXPLAIN on the query, **Then** the index is utilized

---

### Edge Cases

- What happens when a user is deleted but their tasks still exist? → CASCADE delete removes user's tasks automatically
- How are individual tasks deleted? → Hard delete: task row is permanently removed from database (no soft delete or deleted_at column)
- How does the system handle concurrent updates to the same task? → Last-write-wins: concurrent writes overwrite without conflict detection; updated_at timestamp reflects the most recent write
- What happens if a task title exceeds maximum length? → 255 character limit enforced at database level; insertion fails with constraint violation
- How are null descriptions handled? → Description is nullable, empty string and null are both valid
- What happens if Better Auth tables don't exist? → First signup/signin attempt fails with "relation does not exist" error; tables must be created before deployment

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST store user accounts with a string/UUID primary key (`id`) and unique email address
- **FR-002**: System MUST store tasks with integer auto-incrementing primary key (`id`)
- **FR-003**: System MUST enforce foreign key relationship between tasks.user_id and user.id with ON DELETE CASCADE
- **FR-004**: System MUST store task title as non-null string (max 255 characters)
- **FR-005**: System MUST store task description as nullable text field
- **FR-006**: System MUST store task completion status as boolean defaulting to false
- **FR-007**: System MUST automatically track created_at timestamp (WITH TIME ZONE) when a task is created
- **FR-008**: System MUST automatically update updated_at timestamp (WITH TIME ZONE) when a task is modified
- **FR-009**: System MUST provide an index on tasks.user_id for efficient user-based queries
- **FR-010**: System MUST provide an index on tasks.completed for efficient status filtering
- **FR-011**: System MUST enforce user isolation - tasks are only accessible via their owner's user_id
- **FR-012**: System MUST cascade delete tasks when their owning user is deleted
- **FR-013**: System MUST store Better Auth session data (session table) with foreign key to user table
- **FR-014**: System MUST store Better Auth account data (account table) with hashed passwords for email/password auth
- **FR-015**: System MUST store Better Auth verification tokens (verification table) for email verification support

### Key Entities

- **User**: Represents an authenticated user account. Managed by Better Auth. Key attributes: id (string/UUID, primary key), email (string, unique, not null), name (string, nullable), email_verified (boolean, default false), image (string, nullable), created_at/updated_at (timestamp with timezone). Relationship: owns zero or more Tasks, Sessions, and Accounts.

- **Task**: Represents a todo item owned by a user. Key attributes: id (integer, auto-increment, primary key), title (string, not null, max 255), description (text, nullable), completed (boolean, default false), created_at (timestamp with timezone, auto-set), updated_at (timestamp with timezone, auto-update), user_id (string/UUID, foreign key to user.id, not null, ON DELETE CASCADE). Relationship: belongs to exactly one User.

- **Session**: Represents an active user session. Managed by Better Auth. Key attributes: id (string, primary key), user_id (foreign key to user.id, ON DELETE CASCADE), token (string, unique), expires_at (timestamp), ip_address (string, nullable), user_agent (string, nullable). Relationship: belongs to exactly one User.

- **Account**: Represents an authentication provider account. Managed by Better Auth. Key attributes: id (string, primary key), user_id (foreign key to user.id, ON DELETE CASCADE), provider_id (string, e.g., "credential"), password (string, nullable, bcrypt hashed). Relationship: belongs to exactly one User.

- **Verification**: Represents email/phone verification tokens. Managed by Better Auth. Key attributes: id (string, primary key), identifier (string), value (string), expires_at (timestamp). Required even if email verification not used.

---

## Better Auth Tables

Better Auth requires four tables to function. These tables **must be created before the first signup attempt** or Better Auth will throw a "relation does not exist" error.

### 1. User Table

The user table stores core user information. Better Auth creates and manages this table's data.

```sql
CREATE TABLE IF NOT EXISTS "user" (
  id TEXT PRIMARY KEY,
  name TEXT,
  email TEXT UNIQUE NOT NULL,
  email_verified BOOLEAN DEFAULT FALSE,
  image TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for email lookups during signin
CREATE INDEX IF NOT EXISTS idx_user_email ON "user"(email);
```

**Field Details**:
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | TEXT | PRIMARY KEY | UUID stored as string (Better Auth default) |
| `name` | TEXT | NULLABLE | User's display name |
| `email` | TEXT | UNIQUE, NOT NULL | User's email address |
| `email_verified` | BOOLEAN | DEFAULT FALSE | Email verification status (unused in Phase 2) |
| `image` | TEXT | NULLABLE | Profile image URL |
| `created_at` | TIMESTAMP WITH TIME ZONE | DEFAULT NOW() | Account creation timestamp |
| `updated_at` | TIMESTAMP WITH TIME ZONE | DEFAULT NOW() | Last update timestamp |

**Notes**:
- Better Auth uses TEXT for id (stores UUID as string), not PostgreSQL UUID type
- Password is NOT stored in user table; it's stored in the account table
- The table name is `"user"` with quotes due to it being a reserved word in PostgreSQL

### 2. Session Table

Stores active user sessions for cookie-based authentication.

```sql
CREATE TABLE IF NOT EXISTS "session" (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for user session lookups
CREATE INDEX IF NOT EXISTS idx_session_user_id ON "session"(user_id);
-- Index for session token validation
CREATE INDEX IF NOT EXISTS idx_session_token ON "session"(token);
```

**Field Details**:
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | TEXT | PRIMARY KEY | Session identifier |
| `user_id` | TEXT | FK → user.id, NOT NULL | Owning user |
| `token` | TEXT | UNIQUE, NOT NULL | Session token (not the JWT) |
| `expires_at` | TIMESTAMP WITH TIME ZONE | NOT NULL | Session expiration time |
| `ip_address` | TEXT | NULLABLE | Client IP address |
| `user_agent` | TEXT | NULLABLE | Client user agent string |
| `created_at` | TIMESTAMP WITH TIME ZONE | DEFAULT NOW() | Creation timestamp |
| `updated_at` | TIMESTAMP WITH TIME ZONE | DEFAULT NOW() | Last update timestamp |

**Notes**:
- ON DELETE CASCADE: When a user is deleted, all their sessions are automatically removed
- The `token` field contains the session token, not the JWT; JWT is generated from session data

### 3. Account Table

Stores authentication provider accounts (email/password credentials or OAuth tokens).

```sql
CREATE TABLE IF NOT EXISTS "account" (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  account_id TEXT NOT NULL,
  provider_id TEXT NOT NULL,
  access_token TEXT,
  refresh_token TEXT,
  access_token_expires_at TIMESTAMP WITH TIME ZONE,
  refresh_token_expires_at TIMESTAMP WITH TIME ZONE,
  scope TEXT,
  id_token TEXT,
  password TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for user account lookups
CREATE INDEX IF NOT EXISTS idx_account_user_id ON "account"(user_id);
-- Index for provider lookups
CREATE INDEX IF NOT EXISTS idx_account_provider ON "account"(provider_id, account_id);
```

**Field Details**:
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | TEXT | PRIMARY KEY | Account identifier |
| `user_id` | TEXT | FK → user.id, NOT NULL | Owning user |
| `account_id` | TEXT | NOT NULL | Provider-specific account ID |
| `provider_id` | TEXT | NOT NULL | Provider name ("credential" for email/password) |
| `access_token` | TEXT | NULLABLE | OAuth access token (unused for email/password) |
| `refresh_token` | TEXT | NULLABLE | OAuth refresh token (unused for email/password) |
| `access_token_expires_at` | TIMESTAMP WITH TIME ZONE | NULLABLE | Access token expiry |
| `refresh_token_expires_at` | TIMESTAMP WITH TIME ZONE | NULLABLE | Refresh token expiry |
| `scope` | TEXT | NULLABLE | OAuth scope |
| `id_token` | TEXT | NULLABLE | OAuth ID token |
| `password` | TEXT | NULLABLE | Bcrypt hashed password (for email/password auth) |
| `created_at` | TIMESTAMP WITH TIME ZONE | DEFAULT NOW() | Creation timestamp |
| `updated_at` | TIMESTAMP WITH TIME ZONE | DEFAULT NOW() | Last update timestamp |

**Notes**:
- For email/password auth: `provider_id = "credential"`, password field contains bcrypt hash
- OAuth fields (access_token, refresh_token, etc.) are unused in Phase 2 but required by schema
- Password hashing is handled by Better Auth; never store plain text passwords

### 4. Verification Table

Stores email/phone verification tokens. Required by Better Auth even if email verification is not used.

```sql
CREATE TABLE IF NOT EXISTS "verification" (
  id TEXT PRIMARY KEY,
  identifier TEXT NOT NULL,
  value TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for identifier lookups
CREATE INDEX IF NOT EXISTS idx_verification_identifier ON "verification"(identifier);
```

**Field Details**:
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | TEXT | PRIMARY KEY | Verification identifier |
| `identifier` | TEXT | NOT NULL | Email or phone number |
| `value` | TEXT | NOT NULL | Verification code/token |
| `expires_at` | TIMESTAMP WITH TIME ZONE | NOT NULL | Token expiry time |
| `created_at` | TIMESTAMP WITH TIME ZONE | DEFAULT NOW() | Creation timestamp |
| `updated_at` | TIMESTAMP WITH TIME ZONE | DEFAULT NOW() | Last update timestamp |

**Notes**:
- This table must exist even if email verification is out of scope
- Better Auth checks for this table during initialization

---

## Task Table (Application-Managed)

The task table is managed by the application (FastAPI/SQLModel), not Better Auth.

```sql
CREATE TABLE IF NOT EXISTS "task" (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Index for user-filtered queries (most common query pattern)
CREATE INDEX IF NOT EXISTS idx_task_user_id ON "task"(user_id);

-- Index for completion status filtering
CREATE INDEX IF NOT EXISTS idx_task_completed ON "task"(completed);

-- Composite index for common query: user's tasks sorted by creation date
CREATE INDEX IF NOT EXISTS idx_task_user_created ON "task"(user_id, created_at DESC);
```

**Field Details**:
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | SERIAL | PRIMARY KEY | Auto-incrementing task ID |
| `title` | VARCHAR(255) | NOT NULL | Task title (max 255 chars) |
| `description` | TEXT | NULLABLE | Task description |
| `completed` | BOOLEAN | NOT NULL, DEFAULT FALSE | Completion status |
| `user_id` | TEXT | FK → user.id, NOT NULL | Owning user ID |
| `created_at` | TIMESTAMP WITH TIME ZONE | NOT NULL, DEFAULT NOW() | Creation timestamp |
| `updated_at` | TIMESTAMP WITH TIME ZONE | NOT NULL, DEFAULT NOW() | Last modification timestamp |

**Foreign Key Behavior**:
- `ON DELETE CASCADE`: When a user is deleted, all their tasks are automatically deleted
- This ensures no orphaned tasks exist in the database

---

## JWT Mode Configuration

### Recommended: HS256 with Shared Secret

Better Auth supports two JWT signing algorithms:
1. **HS256** (HMAC-SHA256) - Uses a shared secret key
2. **RS256** (RSA-SHA256) - Uses public/private key pair, requires JWKS table

**CRITICAL**: Use HS256 to avoid the "relation jwks does not exist" error.

### Why HS256 Over RS256/JWKS

| Aspect | HS256 (Recommended) | RS256/JWKS |
|--------|---------------------|------------|
| Key Type | Shared secret | Public/private key pair |
| Database | No JWKS table needed | Requires JWKS table |
| Setup Complexity | Simple | More complex |
| Use Case | Single-service, trusted backend | Multi-service, distributed systems |
| Error Risk | None | "relation jwks does not exist" |

For a Todo app with a single backend service, HS256 is simpler and sufficient.

### Configuration

**Frontend (Better Auth)** - Configure HS256 mode:

```typescript
// lib/auth.ts
import { betterAuth } from "better-auth";
import { jwt } from "better-auth/plugins";

export const auth = betterAuth({
  database: pool,
  emailAndPassword: { enabled: true },
  plugins: [
    jwt({
      jwt: {
        // HS256 uses BETTER_AUTH_SECRET as signing key
        // This avoids the need for JWKS table
        definePayload: ({ user }) => ({
          sub: user.id,
          email: user.email,
        }),
      },
    }),
  ],
});
```

**Backend (FastAPI)** - Verify with HS256:

```python
import jwt
import os

def verify_token(token: str) -> dict:
    return jwt.decode(
        token,
        key=os.getenv("BETTER_AUTH_SECRET"),
        algorithms=["HS256"]  # Must match frontend
    )
```

### BETTER_AUTH_SECRET Requirement

- **Minimum length**: 32 characters
- **Must be identical** in frontend and backend environments
- Mismatch causes `401 Unauthorized` on all protected API calls

Generate a secure secret:
```bash
openssl rand -base64 32
```

---

## JWKS Table (Optional - NOT Recommended)

If you must use RS256/JWKS mode (not recommended for this project), you would need to create a JWKS table:

```sql
-- ONLY CREATE IF USING RS256/JWKS MODE (NOT RECOMMENDED)
CREATE TABLE IF NOT EXISTS "jwks" (
  id TEXT PRIMARY KEY,
  public_key TEXT NOT NULL,
  private_key TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

**Why We Don't Use JWKS**:
1. Adds database complexity for no benefit in single-backend architecture
2. Causes "relation jwks does not exist" errors if forgotten
3. HS256 with shared secret is simpler and equally secure for this use case

**If you see "relation jwks does not exist"**:
- You likely have JWKS mode enabled in Better Auth config
- Solution: Switch to HS256 mode (see JWT Mode Configuration above)
- Do NOT create the JWKS table as a workaround; fix the configuration instead

---

## Database Adapter Setup

### Frontend: pg Pool Adapter

Better Auth requires a database adapter to persist users, sessions, and accounts. The pg Pool adapter is required for PostgreSQL.

```typescript
// lib/auth.ts
import { Pool } from "pg";
import { betterAuth } from "better-auth";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Connection pool settings (optional)
  max: 10,  // Maximum connections in pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

export const auth = betterAuth({
  database: pool,  // pg Pool adapter
  emailAndPassword: { enabled: true },
  // ... other config
});
```

**Required Package**: `pg`
```bash
npm install pg @types/pg
```

**Without the pg Pool adapter**:
- Better Auth cannot connect to the database
- Users will not be persisted after signup
- Sessions will not be stored

### Backend: SQLModel/SQLAlchemy

The FastAPI backend uses SQLModel (built on SQLAlchemy) for task operations. It does NOT need the Better Auth adapter.

```python
# backend/database.py
from sqlmodel import create_engine, SQLModel, Session
import os

DATABASE_URL = os.getenv("DATABASE_URL")

# SQLAlchemy engine with connection pooling
engine = create_engine(
    DATABASE_URL,
    pool_size=5,
    max_overflow=10,
    pool_timeout=30,
)

def get_session():
    with Session(engine) as session:
        yield session
```

### Connection String Format

```
DATABASE_URL=postgresql://username:password@host:port/database?sslmode=require
```

**Neon Serverless PostgreSQL**:
- Use the connection string from Neon dashboard
- Include `?sslmode=require` for secure connections
- Consider using pooled connection strings for serverless environments

---

## Table Creation / Migration Process

### Strategy Options

1. **Manual SQL Execution** (Development)
   - Run SQL statements directly in Neon SQL Editor or psql
   - Quick for initial setup and testing

2. **Migration Script** (Recommended for Production)
   - Create a single migration file with all tables
   - Track migrations with a tool (Alembic, Prisma Migrate)

3. **Application Startup Check** (Optional)
   - Verify tables exist on application start
   - Log warnings if tables missing; do not auto-create

### Complete Migration Script

Run this script to create all required tables:

```sql
-- Migration: 001_auth_and_task_tables.sql
-- Purpose: Create all tables for Better Auth and task management
-- Run this BEFORE first deployment / signup attempt

-- 1. User table (Better Auth)
CREATE TABLE IF NOT EXISTS "user" (
  id TEXT PRIMARY KEY,
  name TEXT,
  email TEXT UNIQUE NOT NULL,
  email_verified BOOLEAN DEFAULT FALSE,
  image TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_user_email ON "user"(email);

-- 2. Session table (Better Auth)
CREATE TABLE IF NOT EXISTS "session" (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_session_user_id ON "session"(user_id);
CREATE INDEX IF NOT EXISTS idx_session_token ON "session"(token);

-- 3. Account table (Better Auth)
CREATE TABLE IF NOT EXISTS "account" (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  account_id TEXT NOT NULL,
  provider_id TEXT NOT NULL,
  access_token TEXT,
  refresh_token TEXT,
  access_token_expires_at TIMESTAMP WITH TIME ZONE,
  refresh_token_expires_at TIMESTAMP WITH TIME ZONE,
  scope TEXT,
  id_token TEXT,
  password TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_account_user_id ON "account"(user_id);
CREATE INDEX IF NOT EXISTS idx_account_provider ON "account"(provider_id, account_id);

-- 4. Verification table (Better Auth)
CREATE TABLE IF NOT EXISTS "verification" (
  id TEXT PRIMARY KEY,
  identifier TEXT NOT NULL,
  value TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_verification_identifier ON "verification"(identifier);

-- 5. Task table (Application)
CREATE TABLE IF NOT EXISTS "task" (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_task_user_id ON "task"(user_id);
CREATE INDEX IF NOT EXISTS idx_task_completed ON "task"(completed);
CREATE INDEX IF NOT EXISTS idx_task_user_created ON "task"(user_id, created_at DESC);
```

### Verification Query

After running migrations, verify all tables exist:

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('user', 'session', 'account', 'verification', 'task');
```

Expected output: 5 rows (all tables present).

### Migration Order (Important)

Tables must be created in this order due to foreign key dependencies:
1. `user` (no dependencies)
2. `session` (depends on user)
3. `account` (depends on user)
4. `verification` (no dependencies, but Better Auth expects it)
5. `task` (depends on user)

---

## Better Auth User Table Integration

### How Better Auth Manages Users

Better Auth is the **sole manager** of the user table. The application should:
- **Never** directly insert/update/delete rows in the user table
- **Only** read user data via Better Auth APIs or JOIN queries
- **Reference** user.id via foreign keys in application tables (e.g., task.user_id)

### User Creation Flow

1. User submits signup form → calls `authClient.signUp.email()`
2. Better Auth validates input (email format, password length)
3. Better Auth hashes password with bcrypt
4. Better Auth creates row in `user` table
5. Better Auth creates row in `account` table (with hashed password)
6. Better Auth creates row in `session` table
7. Better Auth returns session token to frontend

### User ID Format

- **Type**: TEXT (string)
- **Format**: UUID v4 (e.g., `"123e4567-e89b-12d3-a456-426614174000"`)
- **Generation**: Better Auth generates UUID automatically
- **Application usage**: Store as TEXT in foreign key columns, not PostgreSQL UUID type

### Accessing User Data

**From Backend (FastAPI)**: Extract user_id from JWT token
```python
# user_id is the 'sub' claim in the JWT
user_id = token_payload["sub"]

# Query tasks for this user
tasks = session.exec(
    select(Task).where(Task.user_id == user_id)
).all()
```

**From Frontend (Next.js)**: Use Better Auth session
```typescript
// Server component
const session = await auth.api.getSession({ headers: await headers() });
const userId = session?.user?.id;

// Client component
const session = await authClient.getSession();
const userId = session?.user?.id;
```

---

## Timestamps and Timezone Handling

### Use TIMESTAMP WITH TIME ZONE

All timestamp columns should use `TIMESTAMP WITH TIME ZONE` (or `TIMESTAMPTZ`) for:
- Consistent handling across time zones
- Automatic conversion to UTC for storage
- Proper display in user's local timezone by application

```sql
-- Correct
created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP

-- Avoid (loses timezone context)
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
```

### Application Handling

**Backend (Python/FastAPI)**:
```python
from datetime import datetime, timezone

# Always use timezone-aware datetimes
now = datetime.now(timezone.utc)
```

**Frontend (TypeScript)**:
```typescript
// Timestamps from database are in UTC
// Display in user's local timezone
const date = new Date(task.created_at);
const localString = date.toLocaleString();
```

---

## Foreign Key CASCADE Behavior

All foreign keys use `ON DELETE CASCADE` to maintain referential integrity:

| Parent Table | Child Table | Cascade Effect |
|--------------|-------------|----------------|
| user | session | User deleted → All sessions deleted |
| user | account | User deleted → All accounts deleted |
| user | task | User deleted → All tasks deleted |

### Why CASCADE Delete?

1. **No orphaned records**: Prevents tasks/sessions without valid user
2. **Simplified cleanup**: Single DELETE removes user and all related data
3. **GDPR compliance**: User deletion removes all personal data

### Alternative Behaviors (Not Used)

| Behavior | Effect | Why Not Used |
|----------|--------|--------------|
| RESTRICT | Prevent parent deletion if children exist | Requires manual cleanup before user deletion |
| SET NULL | Set foreign key to NULL | Would create orphaned tasks with NULL user_id |
| NO ACTION | Same as RESTRICT (default) | Same issues as RESTRICT |

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: All task data (title, description, completion status, timestamps) persists correctly across application restarts with 100% data integrity
- **SC-002**: User A cannot access, view, or modify User B's tasks under any query condition
- **SC-003**: Task queries filtered by user_id return results in under 100ms for databases with up to 100,000 tasks
- **SC-004**: Task queries filtered by completion status return results in under 100ms for databases with up to 100,000 tasks
- **SC-005**: Database schema supports all CRUD operations: create task, read task(s), update task, delete task
- **SC-006**: Foreign key constraint prevents orphaned tasks (tasks without valid user owners)
- **SC-007**: Timestamps accurately reflect creation and modification times with timezone-aware storage (WITH TIME ZONE)

### Implementation Readiness Criteria

- **SC-008**: All five required tables (user, session, account, verification, task) exist before first signup
- **SC-009**: Zero "relation does not exist" errors during authentication flow
- **SC-010**: Zero JWKS-related errors (HS256 mode configured correctly)
- **SC-011**: Database adapter (pg Pool) successfully connects on frontend startup
- **SC-012**: ON DELETE CASCADE correctly removes all user data when user is deleted

## Assumptions

- Better Auth manages the user, session, account, and verification tables; this spec documents the expected structure for integration
- Better Auth does NOT auto-create tables; they must be created manually or via migration before deployment
- SQLModel ORM will be used to define the Task model in Python; Better Auth tables are not modeled in SQLModel
- Neon Serverless PostgreSQL is the target database platform
- pg Pool adapter is available and compatible with Better Auth
- HS256 JWT mode is used; JWKS/RS256 is explicitly avoided
- `BETTER_AUTH_SECRET` environment variable is configured identically in frontend and backend
- Tables are created in dependency order (user first, then tables with foreign keys)
- Timestamps use `TIMESTAMP WITH TIME ZONE` for timezone-aware storage
- CASCADE delete behavior is acceptable for user → tasks/sessions/accounts relationships
- No additional tables required for Phase 2 (chatbot features are Phase 3+)

## Out of Scope

- Migration scripts and Alembic configuration (implementation concern, though complete SQL provided)
- Advanced indexing strategies beyond user_id, completed, and common composite indexes
- Database views, stored procedures, or triggers
- Schema for Phase 3+ features (chatbot conversations, recurring tasks, reminders)
- Connection pooling tuning and database scaling configuration
- Backup and recovery procedures
- JWKS table and RS256 JWT mode (explicitly avoided)
- OAuth provider tables and social login support

---

## Implementation Checklist

Before deployment, verify:

### Database Tables
- [ ] `user` table exists with correct schema
- [ ] `session` table exists with foreign key to user
- [ ] `account` table exists with foreign key to user
- [ ] `verification` table exists
- [ ] `task` table exists with foreign key to user
- [ ] All foreign keys have ON DELETE CASCADE
- [ ] All indexes created (verify with `\di` in psql)

### JWT Configuration
- [ ] Better Auth configured with HS256 mode (not RS256/JWKS)
- [ ] `BETTER_AUTH_SECRET` is at least 32 characters
- [ ] `BETTER_AUTH_SECRET` is identical in frontend `.env.local` and backend `.env`
- [ ] JWKS table is NOT created (confirms HS256 mode)

### Database Connection
- [ ] pg Pool adapter configured in frontend `lib/auth.ts`
- [ ] `DATABASE_URL` points to correct Neon database
- [ ] SSL mode is `require` for production
- [ ] Connection pooling tested under load

### Timestamps
- [ ] All timestamp columns use `TIMESTAMP WITH TIME ZONE`
- [ ] Application handles UTC correctly
- [ ] created_at and updated_at auto-populate on insert/update

### Verification
```sql
-- Run this to verify setup
SELECT
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public'
AND table_name IN ('user', 'session', 'account', 'verification', 'task');
```

Expected: 5 rows with appropriate column counts (user: 7, session: 8, account: 12, verification: 6, task: 7).

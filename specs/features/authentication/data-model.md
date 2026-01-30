# Data Model: Authentication (Phase 2)

**Feature**: Authentication
**Created**: 2026-01-19
**Updated**: 2026-01-26
**Spec Reference**: @specs/features/authentication/spec.md

## Changes Summary (2026-01-26)

- Added complete SQL schemas for all Better Auth tables
- Added session, account, verification table definitions
- Updated user table to match Better Auth exact schema
- Added foreign key relationships

---

## Entities

### User (Better Auth)

Represents an authenticated user account. **Managed by Better Auth**.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | TEXT | PRIMARY KEY | Unique identifier (UUID format) |
| `name` | TEXT | NULLABLE | User's display name |
| `email` | TEXT | UNIQUE, NOT NULL | User's email address |
| `email_verified` | BOOLEAN | DEFAULT FALSE | Email verification status |
| `image` | TEXT | NULLABLE | Profile image URL |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Account creation timestamp |
| `updated_at` | TIMESTAMP | DEFAULT NOW() | Last update timestamp |

**SQL Schema**:
```sql
CREATE TABLE IF NOT EXISTS "user" (
  id TEXT PRIMARY KEY,
  name TEXT,
  email TEXT UNIQUE NOT NULL,
  email_verified BOOLEAN DEFAULT FALSE,
  image TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Notes**:
- Better Auth uses TEXT for id (stores UUID as string)
- Password is NOT stored in user table (stored in account table)
- email_verified not used in Phase 2 (email verification out of scope)

---

### Session (Better Auth)

Represents an active user session. **Managed by Better Auth**.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | TEXT | PRIMARY KEY | Session identifier |
| `user_id` | TEXT | FK → user.id, NOT NULL | Owning user |
| `token` | TEXT | UNIQUE, NOT NULL | Session token |
| `expires_at` | TIMESTAMP | NOT NULL | Expiration time |
| `ip_address` | TEXT | NULLABLE | Client IP |
| `user_agent` | TEXT | NULLABLE | Client user agent |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Creation timestamp |
| `updated_at` | TIMESTAMP | DEFAULT NOW() | Last update timestamp |

**SQL Schema**:
```sql
CREATE TABLE IF NOT EXISTS "session" (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Notes**:
- token field contains the session token (not JWT)
- JWT is generated from session data, not stored
- ON DELETE CASCADE removes sessions when user deleted

---

### Account (Better Auth)

Represents an authentication provider account. **Managed by Better Auth**.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | TEXT | PRIMARY KEY | Account identifier |
| `user_id` | TEXT | FK → user.id, NOT NULL | Owning user |
| `account_id` | TEXT | NOT NULL | Provider account ID |
| `provider_id` | TEXT | NOT NULL | Provider name (e.g., "credential") |
| `access_token` | TEXT | NULLABLE | OAuth access token |
| `refresh_token` | TEXT | NULLABLE | OAuth refresh token |
| `access_token_expires_at` | TIMESTAMP | NULLABLE | Access token expiry |
| `refresh_token_expires_at` | TIMESTAMP | NULLABLE | Refresh token expiry |
| `scope` | TEXT | NULLABLE | OAuth scope |
| `id_token` | TEXT | NULLABLE | OAuth ID token |
| `password` | TEXT | NULLABLE | Hashed password (for email/password) |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Creation timestamp |
| `updated_at` | TIMESTAMP | DEFAULT NOW() | Last update timestamp |

**SQL Schema**:
```sql
CREATE TABLE IF NOT EXISTS "account" (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  account_id TEXT NOT NULL,
  provider_id TEXT NOT NULL,
  access_token TEXT,
  refresh_token TEXT,
  access_token_expires_at TIMESTAMP,
  refresh_token_expires_at TIMESTAMP,
  scope TEXT,
  id_token TEXT,
  password TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Notes**:
- For email/password auth, `provider_id = "credential"`
- Password is bcrypt hashed (managed by Better Auth)
- OAuth fields unused in Phase 2 (social login out of scope)

---

### Verification (Better Auth)

Represents email verification tokens. **Managed by Better Auth**.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | TEXT | PRIMARY KEY | Verification identifier |
| `identifier` | TEXT | NOT NULL | Email or phone |
| `value` | TEXT | NOT NULL | Verification code/token |
| `expires_at` | TIMESTAMP | NOT NULL | Token expiry |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Creation timestamp |
| `updated_at` | TIMESTAMP | DEFAULT NOW() | Last update timestamp |

**SQL Schema**:
```sql
CREATE TABLE IF NOT EXISTS "verification" (
  id TEXT PRIMARY KEY,
  identifier TEXT NOT NULL,
  value TEXT NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Notes**:
- Required by Better Auth even if email verification not used
- Table must exist or Better Auth will error

---

### Task (Extended)

Existing task entity extended with user ownership.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, NOT NULL | Task identifier |
| `title` | VARCHAR(200) | NOT NULL | Task title |
| `description` | TEXT | NULLABLE | Task description |
| `completed` | BOOLEAN | NOT NULL, DEFAULT FALSE | Completion status |
| `priority` | VARCHAR(10) | NULLABLE | Priority level (P1/P2/P3) |
| `due_date` | DATE | NULLABLE | Due date |
| `created_at` | TIMESTAMP | NOT NULL, DEFAULT NOW() | Creation timestamp |
| `updated_at` | TIMESTAMP | NOT NULL | Last update timestamp |
| **`user_id`** | TEXT | **FK → user.id, NOT NULL** | **Owning user (NEW)** |

**SQL Migration**:
```sql
-- Add user_id column to existing task table
ALTER TABLE task ADD COLUMN user_id TEXT REFERENCES "user"(id) ON DELETE CASCADE;

-- Add index for filtered queries
CREATE INDEX idx_task_user_id ON task(user_id);
```

**Notes**:
- `user_id` is TEXT to match Better Auth's user.id type
- All queries must filter by `user_id` for authenticated user
- Cascading delete: When user deleted, tasks deleted

**Validation Rules**:
- Title: ≤200 characters, no control characters
- user_id: Must match authenticated user on create

---

### JWT Token (Stateless)

Not persisted in database; exists only in signed token form.

| Claim | Type | Description |
|-------|------|-------------|
| `sub` | String (UUID) | Subject - the user_id |
| `email` | String | User's email address |
| `exp` | Number (Unix timestamp) | Expiration time |
| `iat` | Number (Unix timestamp) | Issued-at time |

**Notes**:
- Signed with HS256 algorithm using `BETTER_AUTH_SECRET`
- Default expiration: 7 days from issuance
- Generated by Better Auth jwt plugin
- Verified by FastAPI backend using PyJWT

---

## Relationships

```
┌─────────┐       1:N       ┌─────────┐
│  User   │────────────────▶│  Task   │
│         │                 │         │
│   id    │◀────────────────│ user_id │
└─────────┘                 └─────────┘
     │
     │ 1:N
     ▼
┌─────────┐       1:N       ┌─────────┐
│ Session │◀────────────────│ Account │
│         │                 │         │
│ user_id │                 │ user_id │
└─────────┘                 └─────────┘
```

**Cardinality**:
- One User → Many Tasks (1:N)
- One User → Many Sessions (1:N) - multiple devices
- One User → Many Accounts (1:N) - multiple auth providers

**Referential Integrity**:
- All foreign keys reference `user.id`
- ON DELETE CASCADE on all relationships

---

## State Transitions

### User Account Lifecycle

```
[Anonymous] ──signup──▶ [Registered] ──signin──▶ [Authenticated]
                              │                        │
                              │                        │ signout
                              │                        ▼
                              │                 [Registered]
                              │                        │
                              └────────────────────────┘
```

### JWT Token Lifecycle

```
[None] ──signin/signup──▶ [Valid] ──time passes──▶ [Expired] ──re-signin──▶ [Valid]
                            │
                            │ signout
                            ▼
                         [Cleared]
```

---

## Indexes

### User Table
- PRIMARY KEY: `id`
- UNIQUE INDEX: `email` (for login lookups)

### Session Table
- PRIMARY KEY: `id`
- INDEX: `user_id` (for user session lookups)
- UNIQUE INDEX: `token` (for session validation)

### Account Table
- PRIMARY KEY: `id`
- INDEX: `user_id` (for user account lookups)

### Task Table
- PRIMARY KEY: `id`
- INDEX: `user_id` (for filtered queries)
- COMPOSITE INDEX: `(user_id, created_at)` (for sorted listing)

---

## Complete Migration Script

```sql
-- Migration: 001_auth_tables.sql
-- Creates all required tables for Better Auth + task extension

-- 1. User table
CREATE TABLE IF NOT EXISTS "user" (
  id TEXT PRIMARY KEY,
  name TEXT,
  email TEXT UNIQUE NOT NULL,
  email_verified BOOLEAN DEFAULT FALSE,
  image TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Session table
CREATE TABLE IF NOT EXISTS "session" (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Account table
CREATE TABLE IF NOT EXISTS "account" (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  account_id TEXT NOT NULL,
  provider_id TEXT NOT NULL,
  access_token TEXT,
  refresh_token TEXT,
  access_token_expires_at TIMESTAMP,
  refresh_token_expires_at TIMESTAMP,
  scope TEXT,
  id_token TEXT,
  password TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Verification table
CREATE TABLE IF NOT EXISTS "verification" (
  id TEXT PRIMARY KEY,
  identifier TEXT NOT NULL,
  value TEXT NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Task table extension (add user_id if not exists)
-- Note: Run this after task table exists
ALTER TABLE task ADD COLUMN IF NOT EXISTS user_id TEXT REFERENCES "user"(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_task_user_id ON task(user_id);
```

**Verification Query**:
```sql
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('user', 'session', 'account', 'verification', 'task');
```

# Quickstart: Authentication

**Feature**: Authentication
**Created**: 2026-01-26
**Spec Reference**: @specs/features/authentication/spec.md

## Prerequisites

- Node.js 18+
- Python 3.13+
- PostgreSQL database (Neon recommended)
- `openssl` for secret generation

## 1. Generate Shared Secret

```bash
# Generate a 32+ character secret
openssl rand -base64 32

# Example output: K7xYz9Abc123DefGhiJklMnoPqrStUvWxYz0=
# Copy this value - you'll use it in both frontend and backend
```

**CRITICAL**: This secret must be IDENTICAL in both services.

## 2. Database Setup

### Create Tables

Run the following SQL in your PostgreSQL database (e.g., Neon SQL Editor):

```sql
-- 1. User table (Better Auth)
CREATE TABLE IF NOT EXISTS "user" (
  id TEXT PRIMARY KEY,
  name TEXT,
  email TEXT UNIQUE NOT NULL,
  email_verified BOOLEAN DEFAULT FALSE,
  image TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Session table (Better Auth)
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

-- 3. Account table (Better Auth)
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

-- 4. Verification table (Better Auth)
CREATE TABLE IF NOT EXISTS "verification" (
  id TEXT PRIMARY KEY,
  identifier TEXT NOT NULL,
  value TEXT NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Verify Tables Exist

```sql
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('user', 'session', 'account', 'verification');
```

Expected output: 4 rows.

## 3. Frontend Setup

### Install Dependencies

```bash
cd frontend
npm install better-auth pg
```

### Configure Environment Variables

Create/update `frontend/.env.local`:

```bash
# Database (same as backend)
DATABASE_URL=postgresql://user:password@host:5432/database?sslmode=require

# Better Auth (MUST match backend)
BETTER_AUTH_SECRET=K7xYz9Abc123DefGhiJklMnoPqrStUvWxYz0=
BETTER_AUTH_URL=http://localhost:3000

# Backend API
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Create Auth Files

**`frontend/lib/auth.ts`** (Server-side):
```typescript
import { betterAuth } from "better-auth";
import { jwt } from "better-auth/plugins";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const auth = betterAuth({
  database: pool,
  emailAndPassword: {
    enabled: true,
  },
  session: {
    cookieCache: {
      enabled: true,
    },
  },
  plugins: [
    jwt({
      jwt: {
        definePayload: ({ user }) => ({
          sub: user.id,
          email: user.email,
        }),
      },
    }),
  ],
});
```

**`frontend/lib/auth-client.ts`** (Client-side):
```typescript
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL || "http://localhost:3000",
});
```

**`frontend/app/api/auth/[...all]/route.ts`**:
```typescript
import { auth } from "@/lib/auth";

export const { GET, POST } = auth.handler;
```

### Test Frontend Auth

```bash
cd frontend
npm run dev

# Test session endpoint
curl http://localhost:3000/api/auth/session
# Should return: {"session":null,"user":null}
```

## 4. Backend Setup

### Install Dependencies

```bash
cd backend
pip install pyjwt python-dotenv
```

### Configure Environment Variables

Create/update `backend/.env`:

```bash
# Database
DATABASE_URL=postgresql://user:password@host:5432/database?sslmode=require

# Auth (MUST match frontend)
BETTER_AUTH_SECRET=K7xYz9Abc123DefGhiJklMnoPqrStUvWxYz0=

# Server
HOST=0.0.0.0
PORT=8000
```

### Create Auth Middleware

**`backend/src/api/middleware/auth.py`**:
```python
import os
import jwt
from jwt.exceptions import ExpiredSignatureError, InvalidTokenError
from fastapi import HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

security = HTTPBearer()

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> str:
    """
    Verify JWT token and return user_id.
    Raises HTTPException(401) if invalid/expired/missing.
    """
    token = credentials.credentials
    secret = os.getenv("BETTER_AUTH_SECRET")

    if not secret:
        raise HTTPException(status_code=500, detail="Auth not configured")

    try:
        payload = jwt.decode(token, secret, algorithms=["HS256"])
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token payload")
        return user_id
    except ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")
```

### Test Backend Auth

```bash
cd backend
uvicorn src.main:app --reload --port 8000

# Test without token (should fail)
curl http://localhost:8000/tasks
# Should return: 401 Unauthorized
```

## 5. Extend Task Table

After auth tables are created and working:

```sql
-- Add user_id to task table
ALTER TABLE task ADD COLUMN user_id TEXT REFERENCES "user"(id) ON DELETE CASCADE;
CREATE INDEX idx_task_user_id ON task(user_id);
```

## 6. Verification Checklist

- [ ] Database tables exist (user, session, account, verification)
- [ ] `BETTER_AUTH_SECRET` is identical in both `.env` files
- [ ] `BETTER_AUTH_SECRET` is at least 32 characters
- [ ] Frontend `/api/auth/session` returns valid JSON
- [ ] Backend returns 401 without token
- [ ] Task table has `user_id` column

## Common Issues & Solutions

### "relation jwks does not exist"
**Cause**: Better Auth defaulting to RS256
**Fix**: Ensure jwt plugin is configured with HS256 (see auth.ts above)

### User not persisted after signup
**Cause**: Missing database adapter
**Fix**: Add `database: pool` to betterAuth config

### 401 Unauthorized on all API calls
**Cause**: Token not attached to requests
**Fix**: Use apiClient with Authorization header (see spec)

### 401 even with valid session
**Cause**: BETTER_AUTH_SECRET mismatch
**Fix**: Verify exact same value in both .env files

## Local Development Workflow

1. Start PostgreSQL (or use Neon)
2. Run migrations (tables created)
3. Start backend: `cd backend && uvicorn src.main:app --reload`
4. Start frontend: `cd frontend && npm run dev`
5. Open http://localhost:3000/signup
6. Create account → should redirect to dashboard
7. API calls should include Authorization header

## Next Steps

1. Create auth forms (signin, signup, signout)
2. Create protected layout with session check
3. Create API client with token attachment
4. Update task service to filter by user_id
5. Test full auth flow

# Feature: Authentication

**Phase**: 2 (Full-Stack Web Application)
**Created**: 2026-01-19
**Updated**: 2026-01-26
**Status**: Draft

## Changes Summary (2026-01-26)

- Added "Better Auth Configuration" section (frontend & backend setup)
- Added "JWT Mode Configuration" section (force HS256, avoid JWKS table errors)
- Added "Database Adapter Setup" section (pg Pool configuration)
- Added "Table Creation / Migration Steps" section (required tables)
- Added "Token Attachment in API Client" section (preventing 401 errors)
- Added "Redirect Logic after Signup/Signin" section
- Added "Common Error Handling & User Messages" section
- Added "Environment Variables Checklist" section (BETTER_AUTH_SECRET sync)
- Added "Client vs Server Component Guidelines" section (Next.js App Router)
- Updated Assumptions and Dependencies with implementation-specific details

---

## Overview

Secure user authentication for the multi-user Todo application using Better Auth for frontend signup/signin and JWT token verification on the backend. Users can only access and manage their own tasks.

## Clarifications

### Session 2026-01-19

- Q: Should authentication endpoints include rate limiting to prevent brute force attacks? → A: Yes, implement rate limiting (e.g., 5 failed attempts per 15 minutes per IP/email)
- Q: What format should user_id use? → A: UUID (Better Auth default)
- Q: Should authentication events be logged for security audit? → A: Yes, log all auth attempts/failures for security audit

### Session 2026-01-26

- Q: Which JWT algorithm should be used? → A: HS256 with shared secret (avoids JWKS table requirement)
- Q: How should the database adapter be configured? → A: Use pg Pool adapter on both frontend and backend with connection pooling
- Q: Where should session handling logic live in Next.js? → A: Server components for initial session fetch; client components for auth actions (signin/signup/signout)

## User Stories

- As a new user, I can sign up with my email and password so that I can create a personal account to store my tasks.
- As a returning user, I can sign in with my credentials so that I can access my previously created tasks.
- As an authenticated user, I can access my tasks via API calls so that the frontend can display and manage my data.
- As an authenticated user, I can only see and modify my own tasks so that my data remains private from other users.
- As a signed-in user, I can sign out so that I can securely end my session.

## Acceptance Criteria

### Signup / Signin

- User can access a signup page and register with email and password
- Email must be unique across all users; duplicate emails are rejected with a clear error message
- Password must meet minimum requirements (at least 8 characters)
- User can access a signin page and authenticate with registered credentials
- Invalid credentials (wrong email or password) display a generic error message without revealing which field is incorrect
- Rate limiting protects signin endpoint: maximum 5 failed attempts per 15 minutes per IP/email combination; excess attempts return `429 Too Many Requests`
- Successful signup automatically signs the user in
- Successful signin redirects user to their task dashboard
- Successful signup redirects user to their task dashboard (auto-signin completes first)

### JWT Issuance & Attachment

- Upon successful signup or signin, a JWT token is issued to the user
- JWT token contains the user's unique identifier (user_id) and expiration timestamp
- Token expiration is configurable (default: 7 days)
- Frontend stores the JWT token securely (via Better Auth mechanisms)
- Frontend attaches the JWT token to every API request using the `Authorization: Bearer <token>` header
- Token is cleared from frontend storage upon signout
- **JWT uses HS256 algorithm with shared secret (not RS256/JWKS)**

### Backend Verification

- All task-related API endpoints require a valid JWT token
- Backend middleware extracts and verifies the JWT from the Authorization header
- Verification uses the shared secret (`BETTER_AUTH_SECRET` environment variable)
- Invalid token (malformed, tampered, or wrong signature) returns `401 Unauthorized`
- Expired token returns `401 Unauthorized`
- Missing token returns `401 Unauthorized`
- Valid token extracts `user_id` and makes it available to endpoint handlers

### Task Ownership & User Isolation

- Each task is associated with a `user_id` (foreign key to the owning user)
- When creating a task, the system automatically assigns the authenticated user's ID
- When listing tasks, only tasks belonging to the authenticated user are returned
- When viewing, updating, or deleting a task, the system verifies the task belongs to the authenticated user
- Attempting to access another user's task returns `404 Not Found` (not `403 Forbidden`, to avoid revealing task existence)

### Signout

- User can trigger signout from the UI
- Signout clears the stored JWT token from the frontend
- After signout, subsequent API requests are rejected until the user signs in again
- User is redirected to the signin page after signout

### Security Logging

- All authentication attempts (signup, signin, signout) are logged with timestamp, email, and outcome (success/failure)
- Failed authentication attempts include failure reason (invalid credentials, rate limited, expired token)
- Logs do not contain sensitive data (passwords, full tokens)
- Logs are available for security audit and incident investigation

---

## Better Auth Configuration

### Frontend Configuration (Next.js)

The frontend must configure Better Auth with the following settings:

#### Auth Client Setup (`lib/auth-client.ts`)

- Import `createAuthClient` from `better-auth/react`
- Set `baseURL` to the frontend's own URL (e.g., `http://localhost:3000` for development)
- The auth client communicates with Better Auth's API routes at `/api/auth/*`

#### Auth API Route (`app/api/auth/[...all]/route.ts`)

- Create a catch-all route handler for Better Auth
- Export `GET` and `POST` handlers using `auth.handler`
- This handles all auth endpoints: `/api/auth/sign-up`, `/api/auth/sign-in`, `/api/auth/sign-out`, `/api/auth/session`, etc.

#### Auth Instance (`lib/auth.ts`)

- Import `betterAuth` from `better-auth`
- Configure with:
  - `database`: pg Pool adapter (see Database Adapter Setup)
  - `emailAndPassword.enabled`: `true`
  - `jwt` plugin with HS256 configuration (see JWT Mode Configuration)
  - `session.cookieCache.enabled`: `true` for performance

### Backend Configuration (FastAPI)

The backend does NOT run Better Auth. It only:

1. Verifies JWT tokens from the frontend
2. Uses the shared `BETTER_AUTH_SECRET` for verification
3. Extracts `user_id` from verified tokens

#### JWT Verification Middleware

- Create a dependency that extracts the `Authorization: Bearer <token>` header
- Decode and verify the JWT using PyJWT with `algorithms=["HS256"]`
- Verify signature using `BETTER_AUTH_SECRET`
- Extract and return `user_id` (field name: `sub` in JWT payload)
- Raise `HTTPException(401)` for invalid/missing/expired tokens

---

## JWT Mode Configuration

### Force HS256 Algorithm (Critical)

Better Auth defaults to RS256 which requires a JWKS (JSON Web Key Set) table. To avoid the `"relation jwks does not exist"` error, **force HS256 mode**:

#### Frontend Auth Configuration

```typescript
// lib/auth.ts
import { betterAuth } from "better-auth";
import { jwt } from "better-auth/plugins";

export const auth = betterAuth({
  // ... other config
  plugins: [
    jwt({
      jwt: {
        // Force HS256 - uses BETTER_AUTH_SECRET as signing key
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

#### Backend JWT Verification

```python
# Must match frontend algorithm
import jwt

def verify_token(token: str) -> dict:
    return jwt.decode(
        token,
        key=os.getenv("BETTER_AUTH_SECRET"),
        algorithms=["HS256"]  # Must match frontend
    )
```

### Why HS256 Over RS256

| Aspect | HS256 | RS256 |
|--------|-------|-------|
| Key Type | Shared secret | Public/private key pair |
| Database | No JWKS table needed | Requires JWKS table |
| Setup | Simpler | More complex |
| Use Case | Single-service, trusted backend | Multi-service, distributed |

For this Todo app with a single backend, HS256 with shared secret is sufficient and simpler.

---

## Database Adapter Setup

### Required: pg Pool Adapter

Better Auth requires a database adapter to persist users, sessions, and accounts. **Without this, users will not be persisted after signup.**

#### Frontend Database Configuration

```typescript
// lib/auth.ts
import { Pool } from "pg";
import { betterAuth } from "better-auth";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const auth = betterAuth({
  database: pool,  // pg Pool adapter
  // ... other config
});
```

#### Connection String Format

```
DATABASE_URL=postgresql://username:password@host:port/database?sslmode=require
```

#### Backend Database Configuration

The backend (FastAPI) uses its own database connection for tasks. It does NOT need the Better Auth adapter—only the shared `BETTER_AUTH_SECRET` for JWT verification.

```python
# backend/database.py
from sqlmodel import create_engine
import os

DATABASE_URL = os.getenv("DATABASE_URL")
engine = create_engine(DATABASE_URL)
```

### Connection Pooling

- Frontend: pg Pool handles connection pooling automatically
- Backend: SQLModel/SQLAlchemy handles connection pooling

---

## Table Creation / Migration Steps

### Required Tables for Better Auth

Better Auth requires the following tables. These **must be created before the first signup**:

#### 1. `user` Table

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

#### 2. `session` Table

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

#### 3. `account` Table

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

#### 4. `verification` Table

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

### Migration Strategy

1. **Development**: Run SQL statements directly or use a migration tool
2. **Production**: Use a proper migration system (e.g., Alembic for Python, Prisma Migrate)
3. **Verification**: After running migrations, verify tables exist:

```sql
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('user', 'session', 'account', 'verification');
```

### Task Table Extension

Add `user_id` foreign key to the existing task table:

```sql
ALTER TABLE task ADD COLUMN user_id TEXT REFERENCES "user"(id) ON DELETE CASCADE;
CREATE INDEX idx_task_user_id ON task(user_id);
```

---

## Token Attachment in API Client

### Problem: 401 Unauthorized on Protected Routes

If the JWT token is not attached to API calls, all protected endpoints will return `401 Unauthorized`.

### Solution: Create a Reusable API Client

#### API Client with Token Attachment (`lib/api-client.ts`)

```typescript
import { authClient } from "./auth-client";

export async function apiClient(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  const session = await authClient.getSession();

  if (!session?.session?.token) {
    // Redirect to login or throw error
    throw new Error("Not authenticated");
  }

  const headers = new Headers(options.headers);
  headers.set("Authorization", `Bearer ${session.session.token}`);
  headers.set("Content-Type", "application/json");

  return fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, {
    ...options,
    headers,
  });
}
```

#### Usage in Components

```typescript
// Fetching tasks
const response = await apiClient("/tasks");
const tasks = await response.json();

// Creating a task
const response = await apiClient("/tasks", {
  method: "POST",
  body: JSON.stringify({ title: "New Task" }),
});
```

### Token Location

Better Auth stores the session token in:
- Cookie: `better-auth.session_token` (httpOnly)
- Accessible via: `authClient.getSession()` which returns `{ session: { token: "..." } }`

---

## Redirect Logic after Signup/Signin

### Signup Flow

1. User submits signup form
2. Call `authClient.signUp.email({ email, password, name })`
3. On success: Better Auth automatically creates session
4. **Immediately redirect** to dashboard: `router.push("/dashboard")`
5. On error: Display user-friendly error message (see Error Handling)

### Signin Flow

1. User submits signin form
2. Call `authClient.signIn.email({ email, password })`
3. On success: Session is established
4. **Immediately redirect** to dashboard: `router.push("/dashboard")`
5. On error: Display generic "Invalid credentials" message

### Implementation Pattern

```typescript
"use client";

import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export function SignupForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const result = await authClient.signUp.email({
      email,
      password,
      name,
    });

    if (result.error) {
      setError(parseAuthError(result.error));
      setLoading(false);
      return;
    }

    // Success - redirect to dashboard
    router.push("/dashboard");
  };
}
```

### Signout Flow

1. User clicks signout button
2. Call `authClient.signOut()`
3. **Immediately redirect** to signin: `router.push("/signin")`

---

## Common Error Handling & User Messages

### Error Code Mapping

| Error Code/Type | User-Friendly Message |
|-----------------|----------------------|
| `USER_ALREADY_EXISTS` | "An account with this email already exists. Please sign in instead." |
| `INVALID_CREDENTIALS` | "Invalid email or password. Please try again." |
| `INVALID_EMAIL` | "Please enter a valid email address." |
| `PASSWORD_TOO_SHORT` | "Password must be at least 8 characters long." |
| `RATE_LIMITED` / `429` | "Too many attempts. Please try again in a few minutes." |
| `NETWORK_ERROR` | "Unable to connect. Please check your internet connection." |
| `UNKNOWN_ERROR` | "Something went wrong. Please try again." |

### Error Parsing Function

```typescript
// lib/auth-errors.ts
export function parseAuthError(error: any): string {
  const code = error?.code || error?.message || "";

  const errorMessages: Record<string, string> = {
    USER_ALREADY_EXISTS: "An account with this email already exists.",
    INVALID_CREDENTIALS: "Invalid email or password.",
    INVALID_EMAIL: "Please enter a valid email address.",
    PASSWORD_TOO_SHORT: "Password must be at least 8 characters.",
    RATE_LIMITED: "Too many attempts. Please try again later.",
  };

  return errorMessages[code] || "Something went wrong. Please try again.";
}
```

### Toast Notifications

Use a toast library (e.g., sonner, react-hot-toast) for consistent error display:

```typescript
import { toast } from "sonner";

// On error
toast.error(parseAuthError(result.error));

// On success
toast.success("Account created successfully!");
```

### Backend Error Responses

FastAPI endpoints should return consistent error responses:

```python
from fastapi import HTTPException

# 401 - Unauthorized
raise HTTPException(status_code=401, detail="Invalid or expired token")

# 404 - Not Found (for accessing other user's task)
raise HTTPException(status_code=404, detail="Task not found")

# 422 - Validation Error (automatic from Pydantic)
# 429 - Rate Limited (from rate limiting middleware)
```

---

## Environment Variables Checklist

### Critical: BETTER_AUTH_SECRET Sync

The `BETTER_AUTH_SECRET` **must be identical** in both frontend and backend. A mismatch causes `401 Unauthorized` errors because the JWT signature verification fails.

### Frontend Environment Variables (`.env.local`)

```bash
# Database
DATABASE_URL=postgresql://user:pass@host:5432/db?sslmode=require

# Better Auth
BETTER_AUTH_SECRET=your-secret-key-min-32-chars  # MUST MATCH BACKEND
BETTER_AUTH_URL=http://localhost:3000  # Frontend URL

# API
NEXT_PUBLIC_API_URL=http://localhost:8000  # Backend URL
```

### Backend Environment Variables (`.env`)

```bash
# Database
DATABASE_URL=postgresql://user:pass@host:5432/db?sslmode=require

# Auth
BETTER_AUTH_SECRET=your-secret-key-min-32-chars  # MUST MATCH FRONTEND

# Server
HOST=0.0.0.0
PORT=8000
```

### Verification Checklist

- [ ] `BETTER_AUTH_SECRET` is at least 32 characters
- [ ] `BETTER_AUTH_SECRET` is identical in frontend `.env.local` and backend `.env`
- [ ] `DATABASE_URL` points to the same database for user data consistency
- [ ] `NEXT_PUBLIC_API_URL` correctly points to the backend
- [ ] No trailing slashes in URLs
- [ ] SSL mode is appropriate for the environment (require for production)

### Secret Generation

Generate a secure secret:

```bash
openssl rand -base64 32
```

---

## Client vs Server Component Guidelines

### Next.js App Router Patterns

Better Auth in Next.js requires careful separation of client and server code.

### Server Components (Default)

Use for:
- Initial page rendering
- Fetching session on page load
- Protected layout wrappers

```typescript
// app/dashboard/layout.tsx (Server Component)
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function DashboardLayout({ children }) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/signin");
  }

  return <>{children}</>;
}
```

### Client Components ("use client")

Use for:
- Auth forms (signup, signin)
- Sign out buttons
- Any component that calls `authClient` methods

```typescript
// components/signout-button.tsx
"use client";

import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

export function SignOutButton() {
  const router = useRouter();

  const handleSignOut = async () => {
    await authClient.signOut();
    router.push("/signin");
  };

  return <button onClick={handleSignOut}>Sign Out</button>;
}
```

### Common Mistakes to Avoid

| Mistake | Problem | Solution |
|---------|---------|----------|
| Using `authClient` in server component | Runtime error | Add `"use client"` directive |
| Using `auth.api.getSession` in client component | Cannot access headers | Use `authClient.getSession()` |
| Mixing `useRouter` with server component | Hooks only work in client | Add `"use client"` or use `redirect()` |
| Not awaiting `headers()` | Next.js 15 requires await | Use `await headers()` |

### File Organization

```
lib/
├── auth.ts           # Server-side auth instance (betterAuth)
├── auth-client.ts    # Client-side auth instance (createAuthClient)
├── api-client.ts     # API client with token attachment
└── auth-errors.ts    # Error parsing utilities

app/
├── api/auth/[...all]/route.ts  # Auth API routes (server)
├── (auth)/
│   ├── signin/page.tsx         # Client component
│   └── signup/page.tsx         # Client component
└── (protected)/
    └── dashboard/
        ├── layout.tsx          # Server component (session check)
        └── page.tsx            # Can be server or client
```

---

## Edge Cases

- **Deleted user with valid token**: If a user account is deleted while their JWT is still valid, API requests return `401 Unauthorized`
- **Concurrent sessions**: Multiple valid tokens may exist for the same user (e.g., different devices); all remain valid until expiry
- **Secret rotation**: If `BETTER_AUTH_SECRET` changes, all existing tokens become invalid; users must re-authenticate
- **Network failure during auth**: Frontend displays appropriate error message; user can retry
- **Token near expiry**: No automatic refresh in initial scope; user re-authenticates when token expires
- **Database connection failure**: Auth forms display "Unable to connect" error; do not expose database details
- **Missing tables**: Better Auth throws error on first auth attempt; ensure migrations run on deployment

## Key Entities

### User
- `user_id`: Unique identifier (UUID format, Better Auth default)
- `email`: Unique email address
- `password_hash`: Securely hashed password (managed by Better Auth)
- `created_at`: Account creation timestamp

### Task (Extended)
- Existing task fields plus:
- `user_id`: Foreign key linking task to owning user

### JWT Token (Stateless)
- `sub`: User ID (identifies the authenticated user)
- `email`: User's email address
- `exp`: Expiration timestamp
- `iat`: Issued-at timestamp
- Signature: Verified using shared secret (HS256)

## Success Criteria

- Users can complete signup in under 30 seconds
- Users can sign in and view their tasks in under 10 seconds
- 100% of requests without valid tokens are rejected
- 100% of users can only access their own tasks (complete user isolation)
- Failed login attempts do not reveal whether the email exists
- System handles 100 concurrent authentication requests without degradation
- **Zero "relation jwks does not exist" errors (HS256 mode)**
- **Zero 401 errors due to missing token attachment**
- **Zero BETTER_AUTH_SECRET mismatch errors**
- **All required tables exist before first signup attempt**

## Scope Boundaries

### In Scope
- Email/password signup and signin
- JWT token issuance and verification (HS256 mode)
- Token attachment to API requests via API client
- User-scoped task filtering
- Signout functionality
- Integration with task-crud (add user_id to task model)
- Rate limiting on authentication endpoints
- Security logging for authentication events
- Database adapter configuration (pg Pool)
- Table creation/migration scripts
- Error handling with user-friendly messages
- Redirect logic after auth actions

### Out of Scope
- Social login / OAuth providers
- Role-based access control (all users have equal permissions)
- Password reset / recovery flow
- Email verification
- Multi-factor authentication
- Database-backed sessions (stateless JWT only)
- Token refresh mechanism
- RS256/JWKS-based JWT (using HS256 for simplicity)

## Assumptions

- Better Auth provides JWT plugin for token generation compatible with standard JWT verification
- Better Auth JWT plugin supports HS256 algorithm with shared secret
- Shared secret (`BETTER_AUTH_SECRET`) is configured identically in both frontend and backend environments
- Existing task model can be extended with `user_id` without breaking changes
- Default JWT expiry of 7 days is acceptable
- Password hashing is handled by Better Auth
- pg Pool adapter is available for PostgreSQL connection
- Required tables (user, session, account, verification) are created before first deployment
- Next.js App Router is used (not Pages Router)
- Better Auth version supports the described configuration options

## Dependencies

- **Better Auth**: Frontend authentication library for signup/signin flows
  - Required plugins: `jwt` (for HS256 token generation)
  - Required adapter: `pg` Pool for PostgreSQL
- **pg**: PostgreSQL client for Node.js (frontend database connection)
- **PyJWT**: Python JWT library for backend token verification
- **task-crud feature**: Must be extended to support `user_id` in task model
- **Environment configuration**: `BETTER_AUTH_SECRET` available to both services (identical value)
- **PostgreSQL database**: Neon or compatible PostgreSQL with required tables

## Implementation Checklist

Before deployment, verify:

- [ ] All four tables created (user, session, account, verification)
- [ ] `BETTER_AUTH_SECRET` is identical in frontend and backend
- [ ] `BETTER_AUTH_SECRET` is at least 32 characters
- [ ] pg Pool adapter configured in frontend `lib/auth.ts`
- [ ] JWT plugin configured with HS256 mode
- [ ] Auth API route created at `app/api/auth/[...all]/route.ts`
- [ ] Auth client created for client components
- [ ] API client includes token attachment logic
- [ ] Protected routes/layouts check session server-side
- [ ] Auth forms are client components with `"use client"`
- [ ] Redirect logic implemented for signup/signin/signout
- [ ] Error messages are user-friendly (no technical details exposed)
- [ ] Backend JWT verification uses HS256 algorithm
- [ ] Task table has `user_id` foreign key
- [ ] Rate limiting middleware configured (optional for MVP)
- [ ] Security logging configured (optional for MVP)

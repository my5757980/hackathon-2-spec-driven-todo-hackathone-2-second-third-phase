---
name: frontend-jwt-client
description: Generate a reusable, typed API client for Next.js that automatically attaches JWT tokens from Better Auth sessions
version: 1.0.0
author: Spec-Driven Development
tags: [next.js, better-auth, jwt, api-client, typescript, authentication]
libraries:
  better-auth: "^1.4.0"
  next.js: "^16.0.0"
  axios: "^1.x (optional)"
---

# Frontend JWT API Client Skill

Generate a centralized, type-safe API client for Next.js applications that automatically handles JWT token attachment from Better Auth sessions, with proper error handling and 401 redirect logic.

## When to Use This Skill

Use this skill when you need to:

- Create a centralized API client for a Next.js App Router project
- Automatically attach JWT Bearer tokens from Better Auth sessions
- Handle authentication errors (401) with redirect to login
- Build type-safe fetch wrappers with TypeScript generics
- Support both client components (`useSession`) and server components (`getSession`)

## Prerequisites

- Next.js 16+ with App Router
- Better Auth configured with Bearer plugin
- TypeScript project
- Backend API expecting `Authorization: Bearer <token>` headers

## Step-by-Step Process

### Step 1: Verify Better Auth Setup

Ensure Better Auth is configured with the Bearer plugin on the server:

```typescript
// lib/auth.ts (server)
import { betterAuth } from "better-auth";
import { bearer } from "better-auth/plugins";

export const auth = betterAuth({
  // ... your config
  plugins: [bearer()]
});
```

And the client is set up:

```typescript
// lib/auth-client.ts (client)
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_AUTH_URL || "http://localhost:3000"
});

export const { useSession, signIn, signOut } = authClient;
```

### Step 2: Create the API Client

Create the centralized API client at `frontend/lib/api.ts`:

```typescript
// frontend/lib/api.ts
import { authClient } from "./auth-client";

// =============================================================================
// Configuration
// =============================================================================

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const LOGIN_REDIRECT_PATH = "/login";

// =============================================================================
// Types
// =============================================================================

export interface ApiError {
  message: string;
  status: number;
  code?: string;
  details?: Record<string, unknown>;
}

export interface ApiResponse<T> {
  data: T;
  status: number;
}

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface RequestOptions<TBody = unknown> {
  method?: HttpMethod;
  body?: TBody;
  headers?: Record<string, string>;
  /** Skip automatic token attachment */
  skipAuth?: boolean;
  /** Skip redirect on 401 */
  skipAuthRedirect?: boolean;
  /** Request timeout in milliseconds */
  timeout?: number;
}

// =============================================================================
// Token Management
// =============================================================================

/**
 * Get JWT token from Better Auth session (client-side)
 * Uses the reactive session from Better Auth client
 */
async function getClientToken(): Promise<string | null> {
  try {
    const session = await authClient.getSession();
    // Better Auth stores the session token that can be used as Bearer
    // The exact field depends on your Better Auth configuration
    return session?.data?.session?.token || null;
  } catch (error) {
    console.warn("[API] Failed to get client session:", error);
    return null;
  }
}

/**
 * Get token from localStorage (for Bearer plugin setup)
 * Use this if you've configured Better Auth to store tokens in localStorage
 */
function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("bearer_token");
}

/**
 * Combined token retrieval - tries session first, then localStorage
 */
async function getToken(): Promise<string | null> {
  // Try session-based token first
  const sessionToken = await getClientToken();
  if (sessionToken) return sessionToken;

  // Fall back to localStorage token (Bearer plugin pattern)
  return getStoredToken();
}

// =============================================================================
// Redirect Handling
// =============================================================================

/**
 * Handle unauthorized access by redirecting to login
 */
function handleUnauthorized(): void {
  if (typeof window !== "undefined") {
    // Store the current URL to redirect back after login
    const returnUrl = encodeURIComponent(window.location.pathname + window.location.search);
    window.location.href = `${LOGIN_REDIRECT_PATH}?returnUrl=${returnUrl}`;
  }
}

// =============================================================================
// Core Fetch Implementation
// =============================================================================

/**
 * Type-safe fetch wrapper with automatic JWT attachment
 */
async function apiFetch<TResponse, TBody = unknown>(
  endpoint: string,
  options: RequestOptions<TBody> = {}
): Promise<ApiResponse<TResponse>> {
  const {
    method = "GET",
    body,
    headers = {},
    skipAuth = false,
    skipAuthRedirect = false,
    timeout = 30000,
  } = options;

  // Build headers
  const requestHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    ...headers,
  };

  // Attach JWT token if not skipped
  if (!skipAuth) {
    const token = await getToken();
    if (token) {
      requestHeaders["Authorization"] = `Bearer ${token}`;
    } else if (!skipAuthRedirect) {
      // No token available and auth is required - redirect to login
      handleUnauthorized();
      throw new Error("No authentication token available");
    }
  }

  // Build request URL
  const url = endpoint.startsWith("http")
    ? endpoint
    : `${API_BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

  // Create abort controller for timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      method,
      headers: requestHeaders,
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    // Handle 401 Unauthorized
    if (response.status === 401 && !skipAuthRedirect) {
      handleUnauthorized();
      throw createApiError("Unauthorized", 401, "UNAUTHORIZED");
    }

    // Handle other error responses
    if (!response.ok) {
      let errorData: Record<string, unknown> = {};
      try {
        errorData = await response.json();
      } catch {
        // Response body is not JSON
      }

      throw createApiError(
        (errorData.message as string) || `HTTP ${response.status}`,
        response.status,
        (errorData.code as string) || undefined,
        errorData
      );
    }

    // Parse successful response
    const data = await response.json() as TResponse;

    return {
      data,
      status: response.status,
    };
  } catch (error) {
    clearTimeout(timeoutId);

    // Re-throw ApiErrors
    if (isApiError(error)) {
      throw error;
    }

    // Handle abort/timeout
    if (error instanceof Error && error.name === "AbortError") {
      throw createApiError("Request timeout", 408, "TIMEOUT");
    }

    // Handle network errors
    throw createApiError(
      error instanceof Error ? error.message : "Network error",
      0,
      "NETWORK_ERROR"
    );
  }
}

// =============================================================================
// Error Utilities
// =============================================================================

function createApiError(
  message: string,
  status: number,
  code?: string,
  details?: Record<string, unknown>
): ApiError {
  return { message, status, code, details };
}

export function isApiError(error: unknown): error is ApiError {
  return (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    "status" in error
  );
}

// =============================================================================
// HTTP Method Helpers
// =============================================================================

export const api = {
  /**
   * GET request
   * @example
   * const { data } = await api.get<User[]>("/users");
   */
  get<TResponse>(
    endpoint: string,
    options?: Omit<RequestOptions, "method" | "body">
  ): Promise<ApiResponse<TResponse>> {
    return apiFetch<TResponse>(endpoint, { ...options, method: "GET" });
  },

  /**
   * POST request
   * @example
   * const { data } = await api.post<Task>("/tasks", { title: "New task" });
   */
  post<TResponse, TBody = unknown>(
    endpoint: string,
    body?: TBody,
    options?: Omit<RequestOptions<TBody>, "method" | "body">
  ): Promise<ApiResponse<TResponse>> {
    return apiFetch<TResponse, TBody>(endpoint, { ...options, method: "POST", body });
  },

  /**
   * PUT request
   * @example
   * const { data } = await api.put<Task>("/tasks/1", { title: "Updated" });
   */
  put<TResponse, TBody = unknown>(
    endpoint: string,
    body?: TBody,
    options?: Omit<RequestOptions<TBody>, "method" | "body">
  ): Promise<ApiResponse<TResponse>> {
    return apiFetch<TResponse, TBody>(endpoint, { ...options, method: "PUT", body });
  },

  /**
   * PATCH request
   * @example
   * const { data } = await api.patch<Task>("/tasks/1", { completed: true });
   */
  patch<TResponse, TBody = unknown>(
    endpoint: string,
    body?: TBody,
    options?: Omit<RequestOptions<TBody>, "method" | "body">
  ): Promise<ApiResponse<TResponse>> {
    return apiFetch<TResponse, TBody>(endpoint, { ...options, method: "PATCH", body });
  },

  /**
   * DELETE request
   * @example
   * await api.delete("/tasks/1");
   */
  delete<TResponse = void>(
    endpoint: string,
    options?: Omit<RequestOptions, "method" | "body">
  ): Promise<ApiResponse<TResponse>> {
    return apiFetch<TResponse>(endpoint, { ...options, method: "DELETE" });
  },
};

// =============================================================================
// Public API Calls (No Auth Required)
// =============================================================================

export const publicApi = {
  get<TResponse>(
    endpoint: string,
    options?: Omit<RequestOptions, "method" | "body" | "skipAuth">
  ): Promise<ApiResponse<TResponse>> {
    return api.get<TResponse>(endpoint, { ...options, skipAuth: true });
  },

  post<TResponse, TBody = unknown>(
    endpoint: string,
    body?: TBody,
    options?: Omit<RequestOptions<TBody>, "method" | "body" | "skipAuth">
  ): Promise<ApiResponse<TResponse>> {
    return api.post<TResponse, TBody>(endpoint, body, { ...options, skipAuth: true });
  },
};

// =============================================================================
// Default Export
// =============================================================================

export default api;
```

### Step 3: Create Domain-Specific API Modules (Optional)

For better organization, create domain-specific API modules:

```typescript
// frontend/lib/api/tasks.ts
import api, { type ApiResponse } from "../api";

export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: "low" | "medium" | "high";
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskDto {
  title: string;
  description?: string;
  priority?: "low" | "medium" | "high";
  dueDate?: string;
}

export interface UpdateTaskDto {
  title?: string;
  description?: string;
  completed?: boolean;
  priority?: "low" | "medium" | "high";
  dueDate?: string;
}

export const tasksApi = {
  list: (): Promise<ApiResponse<Task[]>> =>
    api.get<Task[]>("/api/tasks"),

  get: (id: string): Promise<ApiResponse<Task>> =>
    api.get<Task>(`/api/tasks/${id}`),

  create: (data: CreateTaskDto): Promise<ApiResponse<Task>> =>
    api.post<Task, CreateTaskDto>("/api/tasks", data),

  update: (id: string, data: UpdateTaskDto): Promise<ApiResponse<Task>> =>
    api.patch<Task, UpdateTaskDto>(`/api/tasks/${id}`, data),

  delete: (id: string): Promise<ApiResponse<void>> =>
    api.delete(`/api/tasks/${id}`),

  toggleComplete: (id: string): Promise<ApiResponse<Task>> =>
    api.patch<Task>(`/api/tasks/${id}/toggle`),
};
```

### Step 4: Usage in Client Components

```typescript
"use client";

import { useEffect, useState } from "react";
import { tasksApi, type Task } from "@/lib/api/tasks";
import { isApiError } from "@/lib/api";

export function TaskList() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTasks() {
      try {
        const { data } = await tasksApi.list();
        setTasks(data);
      } catch (err) {
        if (isApiError(err)) {
          // 401 errors are auto-redirected, this handles other errors
          setError(err.message);
        } else {
          setError("Failed to fetch tasks");
        }
      } finally {
        setLoading(false);
      }
    }

    fetchTasks();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <ul>
      {tasks.map((task) => (
        <li key={task.id}>{task.title}</li>
      ))}
    </ul>
  );
}
```

### Step 5: Usage in Server Components

For server components, use the server-side session:

```typescript
// frontend/lib/api-server.ts
import { auth } from "./auth";
import { headers } from "next/headers";

const API_BASE_URL = process.env.API_URL || "http://localhost:8000";

/**
 * Server-side API fetch with session token
 */
export async function serverFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("Unauthorized");
  }

  const url = `${API_BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${session.session.token}`,
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  return response.json();
}
```

Usage in a Server Component:

```typescript
// app/dashboard/page.tsx
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { serverFetch } from "@/lib/api-server";

interface Task {
  id: string;
  title: string;
}

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  const tasks = await serverFetch<Task[]>("/api/tasks");

  return (
    <div>
      <h1>Welcome {session.user.name}</h1>
      <ul>
        {tasks.map((task) => (
          <li key={task.id}>{task.title}</li>
        ))}
      </ul>
    </div>
  );
}
```

## Output Format

When invoking this skill, the output will be:

1. **Primary file**: `frontend/lib/api.ts` - Core API client with JWT handling
2. **Optional files**:
   - `frontend/lib/api-server.ts` - Server-side fetch helper
   - `frontend/lib/api/<domain>.ts` - Domain-specific API modules

## Configuration Options

| Option | Default | Description |
|--------|---------|-------------|
| `API_BASE_URL` | `http://localhost:8000` | Base URL for API calls |
| `LOGIN_REDIRECT_PATH` | `/login` | Path to redirect on 401 |
| `timeout` | `30000` | Request timeout in ms |

## Key Patterns Implemented

1. **Automatic Token Attachment**: JWT from Better Auth session added to all requests
2. **401 Redirect**: Automatic redirect to login with return URL preservation
3. **Type Safety**: Full TypeScript generics for request/response types
4. **Error Handling**: Structured `ApiError` type with status codes
5. **Dual Environment**: Works in both client and server components
6. **Public API Support**: `publicApi` helper for unauthenticated endpoints

## Library Versions Used

| Library | Version | Notes |
|---------|---------|-------|
| Better Auth | ^1.4.0 | With Bearer plugin for JWT |
| Next.js | ^16.0.0 | App Router with async headers() |
| TypeScript | ^5.0.0 | For type safety |

## Testing Checklist

- [ ] Token is attached to authenticated requests
- [ ] 401 response triggers redirect to /login
- [ ] Return URL is preserved in redirect
- [ ] Public endpoints work without token
- [ ] Type inference works for responses
- [ ] Server components can fetch with session
- [ ] Timeout handling works correctly
- [ ] Network errors are caught and typed

## Related Skills

- `backend-jwt-middleware` - FastAPI JWT verification
- `better-auth-setup` - Better Auth initial configuration
- `nextjs-protected-routes` - Route protection patterns

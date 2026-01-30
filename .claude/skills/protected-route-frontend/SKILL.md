---
name: protected-route-frontend
description: Generate protected route wrappers and layouts for Next.js App Router with Better Auth session validation
version: 1.0.0
author: Spec-Driven Development
tags: [next.js, better-auth, protected-routes, authentication, layout, middleware, session]
libraries:
  better-auth: "^1.4.0"
  next.js: "^16.0.0"
---

# Protected Route Frontend Skill

Generate protected route wrappers, layouts, and middleware for Next.js App Router applications that validate Better Auth sessions and redirect unauthenticated users to login.

## When to Use This Skill

Use this skill when you need to:

- Protect entire route groups (e.g., `/dashboard/*`) with authentication
- Implement server-side session validation in layouts
- Add middleware for optimistic route protection
- Create client-side protection wrappers with loading states
- Handle authenticated/unauthenticated redirects
- Type session data for TypeScript projects

## Prerequisites

- Next.js 16+ with App Router
- Better Auth configured with `auth.ts` server instance
- Better Auth client configured with `auth-client.ts`
- TypeScript project (recommended)

## Protection Strategies

| Strategy | Location | When to Use |
|----------|----------|-------------|
| **Layout (Server)** | `app/(protected)/layout.tsx` | Primary protection - secure, runs on every request |
| **Middleware** | `middleware.ts` | Optimistic redirects - fast but less secure alone |
| **Page (Server)** | Individual `page.tsx` | Per-page protection when needed |
| **Client Wrapper** | `components/ProtectedRoute.tsx` | Client-side fallback with loading states |

**Recommended**: Use Layout + Middleware together for defense-in-depth.

## Step-by-Step Process

### Step 1: Ensure Better Auth Setup

Verify your Better Auth server instance exists:

```typescript
// lib/auth.ts (server)
import { betterAuth } from "better-auth";
import { bearer } from "better-auth/plugins";

export const auth = betterAuth({
  database: {
    // your database config
  },
  plugins: [bearer()],
});

export type Session = typeof auth.$Infer.Session;
```

And your client instance:

```typescript
// lib/auth-client.ts (client)
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
});

export const { useSession, signIn, signOut } = authClient;
```

### Step 2: Create Protected Layout (Primary Protection)

Create a route group with a protected layout:

```typescript
// app/(protected)/layout.tsx
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { ReactNode } from "react";

interface ProtectedLayoutProps {
  children: ReactNode;
}

export default async function ProtectedLayout({ children }: ProtectedLayoutProps) {
  // Get session from Better Auth server API
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // Redirect to login if no valid session
  if (!session) {
    redirect("/login");
  }

  // Render protected content
  return <>{children}</>;
}
```

### Step 3: Create Protected Layout with User Context

For layouts that need to pass user data to children:

```typescript
// app/(protected)/layout.tsx
import { auth, type Session } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { ReactNode } from "react";

// Optional: Create a context for session data
import { SessionProvider } from "@/components/providers/SessionProvider";

interface ProtectedLayoutProps {
  children: ReactNode;
}

export default async function ProtectedLayout({ children }: ProtectedLayoutProps) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  // Pass session to client components via context
  return (
    <SessionProvider session={session}>
      <div className="min-h-screen">
        {/* Optional: Add protected navigation */}
        <ProtectedHeader user={session.user} />
        <main className="container mx-auto px-4 py-8">
          {children}
        </main>
      </div>
    </SessionProvider>
  );
}

// Server component for header
function ProtectedHeader({ user }: { user: Session["user"] }) {
  return (
    <header className="border-b bg-background">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">Todo App</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">
            {user.name || user.email}
          </span>
          {/* Sign out button (client component) */}
          <SignOutButton />
        </div>
      </div>
    </header>
  );
}
```

### Step 4: Create Session Provider (Client Context)

```typescript
// components/providers/SessionProvider.tsx
"use client";

import { createContext, useContext, ReactNode } from "react";
import type { Session } from "@/lib/auth";

interface SessionContextValue {
  session: Session;
  user: Session["user"];
}

const SessionContext = createContext<SessionContextValue | null>(null);

interface SessionProviderProps {
  children: ReactNode;
  session: Session;
}

export function SessionProvider({ children, session }: SessionProviderProps) {
  return (
    <SessionContext.Provider value={{ session, user: session.user }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSessionContext() {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error("useSessionContext must be used within SessionProvider");
  }
  return context;
}

// Convenience hook for just the user
export function useUser() {
  const { user } = useSessionContext();
  return user;
}
```

### Step 5: Add Middleware for Optimistic Protection

Create middleware for fast, optimistic redirects:

```typescript
// middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

// Routes that require authentication
const protectedRoutes = ["/dashboard", "/tasks", "/settings", "/profile"];

// Routes that should redirect authenticated users (login, signup)
const authRoutes = ["/login", "/signup", "/sign-in", "/sign-up"];

// Routes to exclude from middleware
const publicRoutes = ["/", "/about", "/pricing"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if current path is protected
  const isProtectedRoute = protectedRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  // Check if current path is an auth route
  const isAuthRoute = authRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  // Skip middleware for public routes
  const isPublicRoute = publicRoutes.includes(pathname);
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Get session from Better Auth
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // Redirect unauthenticated users from protected routes to login
  if (isProtectedRoute && !session) {
    const loginUrl = new URL("/login", request.url);
    // Preserve the original URL for redirect after login
    loginUrl.searchParams.set("returnUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect authenticated users from auth routes to dashboard
  if (isAuthRoute && session) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  // Match all routes except static files and API routes
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.svg$).*)",
  ],
  runtime: "nodejs", // Required for Better Auth session check
};
```

### Step 6: Create Client-Side Protection Wrapper

For additional client-side protection with loading states:

```typescript
// components/auth/ProtectedRoute.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

interface ProtectedRouteProps {
  children: React.ReactNode;
  /** Custom loading component */
  fallback?: React.ReactNode;
  /** Redirect path when not authenticated */
  redirectTo?: string;
}

export function ProtectedRoute({
  children,
  fallback,
  redirectTo = "/login",
}: ProtectedRouteProps) {
  const router = useRouter();
  const { data: session, isPending, error } = authClient.useSession();

  useEffect(() => {
    // Only redirect after loading completes and no session exists
    if (!isPending && !session) {
      const returnUrl = encodeURIComponent(window.location.pathname);
      router.push(`${redirectTo}?returnUrl=${returnUrl}`);
    }
  }, [isPending, session, router, redirectTo]);

  // Show loading state
  if (isPending) {
    return fallback || <DefaultLoadingFallback />;
  }

  // Show error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-destructive">Authentication error</p>
          <button
            onClick={() => router.push(redirectTo)}
            className="mt-4 text-primary underline"
          >
            Go to login
          </button>
        </div>
      </div>
    );
  }

  // No session - will redirect via useEffect
  if (!session) {
    return fallback || <DefaultLoadingFallback />;
  }

  // Authenticated - render children
  return <>{children}</>;
}

function DefaultLoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="flex flex-col items-center gap-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        <p className="text-muted-foreground">Checking authentication...</p>
      </div>
    </div>
  );
}
```

### Step 7: Create Auth Guard Hook

A reusable hook for components that need auth status:

```typescript
// hooks/useAuthGuard.ts
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

interface UseAuthGuardOptions {
  /** Redirect to this path if not authenticated */
  redirectTo?: string;
  /** If true, redirects authenticated users (for login pages) */
  redirectIfAuthenticated?: boolean;
  /** Where to redirect authenticated users */
  authenticatedRedirectTo?: string;
}

export function useAuthGuard(options: UseAuthGuardOptions = {}) {
  const {
    redirectTo = "/login",
    redirectIfAuthenticated = false,
    authenticatedRedirectTo = "/dashboard",
  } = options;

  const router = useRouter();
  const { data: session, isPending, error, refetch } = authClient.useSession();

  useEffect(() => {
    if (isPending) return;

    if (redirectIfAuthenticated && session) {
      // Redirect authenticated users away from auth pages
      router.push(authenticatedRedirectTo);
    } else if (!redirectIfAuthenticated && !session) {
      // Redirect unauthenticated users to login
      const returnUrl = encodeURIComponent(window.location.pathname);
      router.push(`${redirectTo}?returnUrl=${returnUrl}`);
    }
  }, [
    isPending,
    session,
    redirectIfAuthenticated,
    redirectTo,
    authenticatedRedirectTo,
    router,
  ]);

  return {
    session,
    user: session?.user || null,
    isLoading: isPending,
    isAuthenticated: !!session,
    error,
    refetch,
  };
}
```

### Step 8: Usage Examples

#### Protected Dashboard Page

```typescript
// app/(protected)/dashboard/page.tsx
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  // Double-check session (defense in depth)
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">
        Welcome back, {session.user.name || "User"}!
      </h1>
      <p className="text-muted-foreground">
        User ID: {session.user.id}
      </p>
      {/* Dashboard content */}
    </div>
  );
}
```

#### Protected Tasks Page with User Filter

```typescript
// app/(protected)/tasks/page.tsx
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { TaskList } from "@/components/tasks/TaskList";

export default async function TasksPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  // Fetch tasks for the authenticated user
  const response = await fetch(
    `${process.env.API_URL}/api/tasks`,
    {
      headers: {
        Authorization: `Bearer ${session.session.token}`,
      },
    }
  );

  const tasks = await response.json();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Your Tasks</h1>
      <TaskList tasks={tasks} userId={session.user.id} />
    </div>
  );
}
```

#### Login Page with Auth Redirect

```typescript
// app/(auth)/login/page.tsx
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/auth/LoginForm";

interface LoginPageProps {
  searchParams: Promise<{ returnUrl?: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  // Check if already authenticated
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // Redirect authenticated users
  if (session) {
    const { returnUrl } = await searchParams;
    redirect(returnUrl || "/dashboard");
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-8">Sign In</h1>
        <LoginForm />
      </div>
    </div>
  );
}
```

#### Client Component Using Auth Guard

```typescript
// components/tasks/CreateTaskButton.tsx
"use client";

import { useAuthGuard } from "@/hooks/useAuthGuard";
import { Button } from "@/components/ui/button";

export function CreateTaskButton() {
  const { isAuthenticated, isLoading, user } = useAuthGuard();

  if (isLoading) {
    return <Button disabled>Loading...</Button>;
  }

  if (!isAuthenticated) {
    return null; // Will redirect via hook
  }

  return (
    <Button onClick={() => {/* create task logic */}}>
      Create Task for {user?.name}
    </Button>
  );
}
```

## Output Format

When invoking this skill, the output includes:

1. **Primary file**: `app/(protected)/layout.tsx` - Server-side layout protection
2. **Secondary files**:
   - `middleware.ts` - Optimistic route protection
   - `components/auth/ProtectedRoute.tsx` - Client wrapper
   - `components/providers/SessionProvider.tsx` - Session context
   - `hooks/useAuthGuard.ts` - Reusable auth hook

## File Structure

```
frontend/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   ├── signup/page.tsx
│   │   └── layout.tsx          # Minimal layout for auth pages
│   ├── (protected)/
│   │   ├── dashboard/page.tsx
│   │   ├── tasks/page.tsx
│   │   ├── settings/page.tsx
│   │   └── layout.tsx          # Protected layout with session check
│   └── page.tsx                 # Public landing page
├── components/
│   ├── auth/
│   │   ├── ProtectedRoute.tsx  # Client wrapper
│   │   ├── LoginForm.tsx
│   │   └── SignOutButton.tsx
│   └── providers/
│       └── SessionProvider.tsx  # Session context
├── hooks/
│   └── useAuthGuard.ts         # Auth guard hook
├── lib/
│   ├── auth.ts                  # Better Auth server
│   └── auth-client.ts           # Better Auth client
└── middleware.ts                # Route protection middleware
```

## Key Patterns Implemented

1. **Server-Side Layout Protection**: `auth.api.getSession()` with `headers()` in layout
2. **Middleware Optimization**: Fast redirects before page renders
3. **Defense in Depth**: Layout + Middleware + Page checks
4. **Session Context**: Pass session from server to client components
5. **Loading States**: `isPending` handling in client components
6. **Return URL Preservation**: Store original path for post-login redirect
7. **Auth Route Protection**: Redirect authenticated users from login/signup

## Library Versions Used

| Library | Version | Notes |
|---------|---------|-------|
| Better Auth | ^1.4.0 | `auth.api.getSession()`, `useSession()` |
| Next.js | ^16.0.0 | App Router, async `headers()`, middleware |

## Testing Checklist

- [ ] Unauthenticated user redirected from protected routes
- [ ] Authenticated user redirected from auth routes (login/signup)
- [ ] Session data available in protected pages
- [ ] Loading state displays while checking session
- [ ] Return URL preserved through login flow
- [ ] Sign out clears session and redirects
- [ ] Middleware catches protected route access
- [ ] Layout performs server-side session check

## Security Considerations

1. **Never trust middleware alone** - Always validate in layouts/pages too
2. **Server-side is authoritative** - Client checks are for UX only
3. **Validate on every request** - Sessions can expire between requests
4. **Secure cookies** - Ensure Better Auth uses httpOnly, secure cookies
5. **CSRF protection** - Better Auth handles this, don't disable it

## Related Skills

- `frontend-jwt-client` - API client with token attachment
- `backend-jwt-middleware` - FastAPI JWT verification
- `better-auth-setup` - Better Auth initial configuration

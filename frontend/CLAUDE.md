# Frontend Guidelines

This file provides guidelines for Claude Code when working on frontend code in the Phase 2 full-stack Todo app.

## Stack

- **Next.js 16+** (App Router)
- **TypeScript** (strict mode)
- **Tailwind CSS 4.x** (utility-first styling)
- **Shadcn UI** (component primitives, dark theme configured)
- **Lucide React** (icons)
- **Framer Motion** (animations, optional)

## Patterns

### Server vs Client Components

- **Use server components by default** - they render on the server, reducing client JS
- **Use client components only when needed**:
  - User interactivity (onClick, onChange, form submissions)
  - Browser APIs (localStorage, window)
  - React hooks (useState, useEffect, useContext)
  - Third-party client-only libraries

```tsx
// Server Component (default) - no directive needed
export default function TaskList({ tasks }) {
  return <ul>{tasks.map(t => <li key={t.id}>{t.title}</li>)}</ul>
}

// Client Component - add directive at top
'use client'
export default function TaskCheckbox({ task, onToggle }) {
  return <input type="checkbox" onChange={() => onToggle(task.id)} />
}
```

### Data Fetching

- Fetch data in server components when possible
- Use React Server Actions for mutations
- Client-side fetching only for real-time updates or user-triggered actions

## Folder Structure

```
frontend/
├── app/                          # Next.js App Router
│   ├── (public)/                 # Public route group (no auth required)
│   │   ├── layout.tsx            # Public layout (minimal header)
│   │   ├── page.tsx              # Landing page (/)
│   │   ├── login/page.tsx        # Login page
│   │   ├── signup/page.tsx       # Signup page
│   │   └── about/page.tsx        # About page
│   ├── (protected)/              # Protected route group (auth required)
│   │   ├── layout.tsx            # Protected layout (full header, auth check)
│   │   ├── dashboard/page.tsx    # Dashboard
│   │   └── settings/
│   │       ├── page.tsx          # Settings index
│   │       └── [section]/page.tsx
│   ├── layout.tsx                # Root layout (theme, fonts, providers)
│   ├── not-found.tsx             # 404 page
│   └── globals.css               # Global styles, design tokens
├── components/
│   ├── ui/                       # Reusable primitives (Shadcn UI based)
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── checkbox.tsx
│   │   ├── avatar.tsx
│   │   ├── toast.tsx
│   │   └── ...
│   ├── features/                 # Feature-specific components
│   │   ├── task/
│   │   │   ├── task-card.tsx
│   │   │   ├── task-list.tsx
│   │   │   ├── task-form.tsx
│   │   │   ├── task-checkbox.tsx
│   │   │   └── priority-badge.tsx
│   │   ├── filter/
│   │   │   ├── filter-bar.tsx
│   │   │   └── filter-chip.tsx
│   │   └── auth/
│   │       ├── login-form.tsx
│   │       ├── signup-form.tsx
│   │       └── user-menu.tsx
│   ├── layout/                   # Layout components
│   │   ├── header.tsx
│   │   ├── footer.tsx
│   │   └── page-container.tsx
│   └── shared/                   # Shared utilities
│       ├── empty-state.tsx
│       ├── loading-spinner.tsx
│       └── error-boundary.tsx
├── lib/
│   ├── api.ts                    # API client for backend calls
│   ├── auth.ts                   # Better Auth client configuration
│   ├── utils.ts                  # Utility functions (cn, formatDate, etc.)
│   └── hooks/
│       ├── use-tasks.ts          # Task-related hooks
│       └── use-auth.ts           # Auth-related hooks
├── types/
│   └── index.ts                  # TypeScript type definitions
└── public/                       # Static assets
```

## API Client

All backend calls MUST go through the centralized API client at `/lib/api.ts`.

### API Client Setup

```typescript
// lib/api.ts
import { getSession } from './auth'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

class ApiClient {
  private async getHeaders(): Promise<HeadersInit> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    }

    // Attach JWT token if authenticated
    const session = await getSession()
    if (session?.token) {
      headers['Authorization'] = `Bearer ${session.token}`
    }

    return headers
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers = await this.getHeaders()
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: { ...headers, ...options.headers },
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.detail || 'API request failed')
    }

    return response.json()
  }

  // Tasks
  async getTasks(filters?: TaskFilters): Promise<Task[]> {
    const params = new URLSearchParams(filters as any).toString()
    return this.request(`/api/tasks${params ? `?${params}` : ''}`)
  }

  async getTask(id: string): Promise<Task> {
    return this.request(`/api/tasks/${id}`)
  }

  async createTask(data: CreateTaskInput): Promise<Task> {
    return this.request('/api/tasks', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateTask(id: string, data: UpdateTaskInput): Promise<Task> {
    return this.request(`/api/tasks/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  }

  async deleteTask(id: string): Promise<void> {
    return this.request(`/api/tasks/${id}`, { method: 'DELETE' })
  }

  async toggleTaskComplete(id: string): Promise<Task> {
    return this.request(`/api/tasks/${id}/toggle`, { method: 'POST' })
  }

  // User
  async getCurrentUser(): Promise<User> {
    return this.request('/api/users/me')
  }

  async updateUser(data: UpdateUserInput): Promise<User> {
    return this.request('/api/users/me', {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  }
}

export const api = new ApiClient()
```

### Usage Examples

```typescript
// In a server component
import { api } from '@/lib/api'

export default async function DashboardPage() {
  const tasks = await api.getTasks()
  return <TaskList tasks={tasks} />
}

// In a client component
'use client'
import { api } from '@/lib/api'
import { useState } from 'react'

export function TaskForm() {
  const [loading, setLoading] = useState(false)

  async function handleSubmit(data: CreateTaskInput) {
    setLoading(true)
    try {
      await api.createTask(data)
      // Show success toast, refresh list
    } catch (error) {
      // Show error toast
    } finally {
      setLoading(false)
    }
  }
}
```

## Auth Integration

### Better Auth Setup

Better Auth handles signup/signin flows. **Do NOT use Zod validation for auth forms** - Better Auth has built-in validation.

```typescript
// lib/auth.ts
import { createAuthClient } from 'better-auth/client'

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
})

export const { signIn, signUp, signOut, getSession, useSession } = authClient
```

### Signup/Signin Forms

```tsx
// components/features/auth/login-form.tsx
'use client'
import { signIn } from '@/lib/auth'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function LoginForm() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    try {
      await signIn.email({ email, password })
      router.push('/dashboard')
    } catch (err) {
      setError('Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields - Better Auth handles validation */}
    </form>
  )
}
```

### OAuth Providers

```tsx
// Google OAuth
await signIn.social({ provider: 'google' })

// GitHub OAuth
await signIn.social({ provider: 'github' })
```

### Protected Routes

Use the protected layout to check authentication:

```tsx
// app/(protected)/layout.tsx
import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSession()

  if (!session) {
    redirect('/login')
  }

  return (
    <>
      <Header user={session.user} />
      <main>{children}</main>
    </>
  )
}
```

### Accessing User Session

```tsx
// Server component
import { getSession } from '@/lib/auth'

export default async function DashboardPage() {
  const session = await getSession()
  return <div>Welcome, {session?.user.name}</div>
}

// Client component
'use client'
import { useSession } from '@/lib/auth'

export function UserMenu() {
  const { data: session, isPending } = useSession()

  if (isPending) return <LoadingSpinner />
  if (!session) return null

  return <Avatar user={session.user} />
}
```

### Logout

```tsx
import { signOut } from '@/lib/auth'
import { useRouter } from 'next/navigation'

function handleLogout() {
  await signOut()
  router.push('/')
}
```

## Styling

### Tailwind CSS Only

- **Use Tailwind CSS classes exclusively** - no inline styles
- **No `style={{ }}` props** - always use className with Tailwind utilities
- **Follow design tokens** from `@specs/ui/components.md`

### Design Tokens (Tailwind Config)

```typescript
// tailwind.config.ts
import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        background: {
          primary: '#0a0a0b',
          secondary: '#141416',
          tertiary: '#1c1c1f',
          elevated: '#232326',
        },
        foreground: {
          primary: '#fafafa',
          secondary: '#a1a1aa',
          muted: '#71717a',
        },
        accent: {
          DEFAULT: '#3b82f6',
          hover: '#2563eb',
          success: '#22c55e',
          warning: '#f59e0b',
          danger: '#ef4444',
          info: '#06b6d4',
        },
        border: {
          DEFAULT: '#27272a',
          subtle: '#1f1f22',
          focus: '#3b82f6',
        },
        priority: {
          high: '#ef4444',
          medium: '#f59e0b',
          low: '#06b6d4',
          none: '#71717a',
        },
      },
      borderRadius: {
        sm: '4px',
        md: '8px',
        lg: '12px',
        xl: '16px',
      },
    },
  },
  plugins: [],
}

export default config
```

### Component Styling Pattern

```tsx
// Use cn() utility for conditional classes
import { cn } from '@/lib/utils'

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive'
  size?: 'sm' | 'md' | 'lg'
  className?: string
  children: React.ReactNode
}

export function Button({ variant = 'primary', size = 'md', className, children }: ButtonProps) {
  return (
    <button
      className={cn(
        // Base styles
        'inline-flex items-center justify-center font-medium rounded-md transition-all',
        'focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2',
        'focus:ring-offset-background-primary disabled:opacity-50',
        // Variant styles
        variant === 'primary' && 'bg-accent text-white hover:bg-accent-hover',
        variant === 'secondary' && 'bg-transparent border border-border text-foreground-primary hover:bg-background-tertiary',
        variant === 'ghost' && 'bg-transparent text-foreground-secondary hover:bg-background-tertiary hover:text-foreground-primary',
        variant === 'destructive' && 'bg-accent-danger text-white hover:bg-red-600',
        // Size styles
        size === 'sm' && 'h-8 px-3 text-xs',
        size === 'md' && 'h-10 px-4 text-sm',
        size === 'lg' && 'h-12 px-6 text-base',
        className
      )}
    >
      {children}
    </button>
  )
}
```

### cn() Utility

```typescript
// lib/utils.ts
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

## Component Guidelines

### UI Components (`/components/ui/`)

- Reusable, generic primitives
- No business logic
- Accept className prop for customization
- Follow Shadcn UI patterns

### Feature Components (`/components/features/`)

- Domain-specific (tasks, auth, filters)
- Can contain business logic
- Compose UI components

### Accessibility Requirements

All components MUST:
- Have proper ARIA labels
- Support keyboard navigation
- Meet WCAG AA contrast ratios (4.5:1 for text)
- Have visible focus indicators

```tsx
// Good: Accessible checkbox
<input
  type="checkbox"
  id={`task-${task.id}`}
  checked={task.completed}
  onChange={handleToggle}
  aria-label={`Mark "${task.title}" as ${task.completed ? 'incomplete' : 'complete'}`}
  className="focus:ring-2 focus:ring-accent"
/>

// Good: Accessible button
<button
  onClick={handleClose}
  aria-label="Close modal"
  className="focus:ring-2 focus:ring-accent focus:ring-offset-2"
>
  <X className="h-4 w-4" />
</button>
```

## Responsive Design

Follow breakpoints from `@specs/ui/pages.md`:

| Breakpoint | Width | Tailwind Prefix |
|------------|-------|-----------------|
| Mobile | < 640px | (default) |
| Tablet | 640-1024px | `sm:` |
| Desktop | > 1024px | `lg:` |

```tsx
// Mobile-first responsive design
<div className="flex flex-col lg:flex-row gap-4">
  <aside className="hidden lg:block w-64">Sidebar</aside>
  <main className="flex-1">Content</main>
</div>
```

## Error Handling

### API Errors

```tsx
'use client'
import { toast } from 'sonner'

async function handleCreateTask(data: CreateTaskInput) {
  try {
    await api.createTask(data)
    toast.success('Task created successfully')
  } catch (error) {
    toast.error(error instanceof Error ? error.message : 'Failed to create task')
  }
}
```

### Loading States

```tsx
// Use loading.tsx for route-level loading
// app/(protected)/dashboard/loading.tsx
export default function DashboardLoading() {
  return <TaskListSkeleton />
}

// Use state for component-level loading
const [loading, setLoading] = useState(false)
```

## References

- **UI Design System**: `@specs/ui/components.md` - Design tokens, component specs, accessibility
- **Page Layouts**: `@specs/ui/pages.md` - Page designs, routing, responsive layouts
- **Architecture**: `@specs/architecture.md` - System overview
- **Better Auth Docs**: https://better-auth.com

## Quick Reference

| Task | How To |
|------|--------|
| Add a new page | Create `app/(public|protected)/[route]/page.tsx` |
| Add a UI component | Create `components/ui/[name].tsx` |
| Add a feature component | Create `components/features/[domain]/[name].tsx` |
| Make API call | Use `api` from `@/lib/api` |
| Check auth | Use `getSession()` (server) or `useSession()` (client) |
| Protect a route | Place in `app/(protected)/` |
| Add styles | Tailwind classes only, reference design tokens |
| Add an icon | Import from `lucide-react` |

---

*Guidelines created: 2026-01-22*
*Phase: 2 (Web Application)*
*Reference Specs: `specs/ui/components.md`, `specs/ui/pages.md`*

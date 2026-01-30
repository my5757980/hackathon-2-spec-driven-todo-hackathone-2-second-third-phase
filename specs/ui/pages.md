# Page Layouts & Routing Specification: Todo App Phase 2

**Feature Branch**: `002-page-layouts`
**Created**: 2026-01-22
**Status**: Draft
**Target Audience**: Frontend developers implementing page layouts, hackathon judges evaluating UI completeness
**Component Reference**: See [specs/ui/components.md](./components.md) for reusable UI primitives

---

## Table of Contents

1. [Application Overview](#application-overview)
2. [Routing Structure](#routing-structure)
3. [Page Specifications](#page-specifications)
   - [Landing Page](#1-landing-page)
   - [Login Page](#2-login-page)
   - [Signup Page](#3-signup-page)
   - [Dashboard](#4-dashboard)
   - [Settings Page](#5-settings-page)
   - [About Page](#6-about-page)
4. [Shared Layouts](#shared-layouts)
5. [Navigation Flow](#navigation-flow)
6. [Authentication Guards](#authentication-guards)
7. [Progressive Enhancement (Phase 3+)](#progressive-enhancement-phase-3)
8. [User Scenarios & Testing](#user-scenarios--testing)
9. [Requirements](#requirements)
10. [Success Criteria](#success-criteria)

---

## Application Overview

### Purpose

The Todo App Phase 2 web interface provides authenticated users with a professional, dark-themed task management experience. The application consists of 6 primary pages that enable users to discover the product, authenticate, manage tasks, customize settings, and learn about the system architecture.

### Page Inventory

| Page | Route | Auth Required | Purpose |
|------|-------|---------------|---------|
| Landing | `/` | No | Marketing page; convert visitors to users |
| Login | `/login` | No | Authenticate existing users |
| Signup | `/signup` | No | Register new users |
| Dashboard | `/dashboard` | Yes | Primary task management interface |
| Settings | `/settings` | Yes | User preferences and account management |
| About | `/about` | No | Project info and architecture showcase |

### Design Principles

1. **Dark Theme Only**: Professional aesthetic optimized for focus and reduced eye strain
2. **Mobile-First**: Responsive layouts that work from 320px to 2560px+
3. **Consistent Navigation**: Predictable header/footer patterns across all pages
4. **Progressive Disclosure**: Show essential info first; reveal details on interaction
5. **Accessibility First**: WCAG AA compliance on all pages (see components.md)

---

## Routing Structure

### Route Map

```
/                     → Landing Page (public)
├── /login           → Login Page (public, redirects if authenticated)
├── /signup          → Signup Page (public, redirects if authenticated)
├── /dashboard       → Dashboard (protected)
├── /settings        → Settings Page (protected)
│   ├── /settings/profile    → Profile settings
│   ├── /settings/account    → Account settings
│   └── /settings/preferences → App preferences
├── /about           → About Page (public)
└── /404             → Not Found (public)
```

### Route Groups (App Router)

```
app/
├── (public)/                    # Public layout group
│   ├── layout.tsx              # Minimal header, no auth UI
│   ├── page.tsx                # Landing page (/)
│   ├── login/page.tsx          # Login
│   ├── signup/page.tsx         # Signup
│   └── about/page.tsx          # About
├── (protected)/                 # Protected layout group
│   ├── layout.tsx              # Full header with user menu
│   ├── dashboard/page.tsx      # Dashboard
│   └── settings/
│       ├── page.tsx            # Settings index
│       ├── profile/page.tsx    # Profile settings
│       ├── account/page.tsx    # Account settings
│       └── preferences/page.tsx # App preferences
├── layout.tsx                   # Root layout (dark theme, fonts)
└── not-found.tsx               # 404 page
```

---

## Page Specifications

### 1. Landing Page

**Route**: `/`
**Auth Required**: No
**Purpose**: Convert visitors to registered users; showcase product value

#### Desktop Layout (>1024px)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  HEADER                                                                      │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │  [Logo] TODO                              [About]  [Login] [Sign Up]  │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  HERO SECTION (min-height: 80vh)                                            │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                                                                       │  │
│  │     ┌─────────────────────────────┐    ┌─────────────────────────┐   │  │
│  │     │                             │    │                         │   │  │
│  │     │   Organize your life,       │    │   ┌─────────────────┐   │   │  │
│  │     │   one task at a time.       │    │   │  App Preview    │   │   │  │
│  │     │                             │    │   │  (Task Cards)   │   │   │  │
│  │     │   A beautiful, minimalist   │    │   │                 │   │   │  │
│  │     │   todo app that helps you   │    │   └─────────────────┘   │   │  │
│  │     │   focus on what matters.    │    │                         │   │  │
│  │     │                             │    │                         │   │  │
│  │     │   [Get Started Free]        │    │                         │   │  │
│  │     │   [Learn More ↓]            │    │                         │   │  │
│  │     │                             │    │                         │   │  │
│  │     └─────────────────────────────┘    └─────────────────────────┘   │  │
│  │                          50%                       50%                │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  FEATURES SECTION                                                            │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │  Why Todo?                                                            │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                │  │
│  │  │ [Icon]       │  │ [Icon]       │  │ [Icon]       │                │  │
│  │  │ Unlimited    │  │ Priority     │  │ Due Dates    │                │  │
│  │  │ Tasks        │  │ Levels       │  │ & Reminders  │                │  │
│  │  │              │  │              │  │              │                │  │
│  │  │ Description  │  │ Description  │  │ Description  │                │  │
│  │  └──────────────┘  └──────────────┘  └──────────────┘                │  │
│  │                                                                       │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                │  │
│  │  │ [Icon]       │  │ [Icon]       │  │ [Icon]       │                │  │
│  │  │ Search &     │  │ Categories   │  │ Secure       │                │  │
│  │  │ Filter       │  │ & Tags       │  │ Auth         │                │  │
│  │  │              │  │              │  │              │                │  │
│  │  │ Description  │  │ Description  │  │ Description  │                │  │
│  │  └──────────────┘  └──────────────┘  └──────────────┘                │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  CTA SECTION                                                                 │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                    Ready to get organized?                            │  │
│  │                    [Create Free Account]                              │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  FOOTER                                                                      │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │  © 2026 Todo App  •  Hackathon II Project  •  [GitHub] [About]       │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
```

#### Mobile Layout (<640px)

```
┌───────────────────────────────┐
│  [☰]  TODO      [Login]       │
├───────────────────────────────┤
│                               │
│   Organize your life,         │
│   one task at a time.         │
│                               │
│   A beautiful, minimalist     │
│   todo app that helps you     │
│   focus on what matters.      │
│                               │
│   [  Get Started Free  ]      │
│                               │
│   ┌───────────────────────┐   │
│   │    App Preview        │   │
│   │    (Stacked below)    │   │
│   └───────────────────────┘   │
│                               │
├───────────────────────────────┤
│  Why Todo?                    │
│  ┌─────────────────────────┐  │
│  │ [Icon] Unlimited Tasks  │  │
│  │ Description text...     │  │
│  └─────────────────────────┘  │
│  ┌─────────────────────────┐  │
│  │ [Icon] Priority Levels  │  │
│  │ Description text...     │  │
│  └─────────────────────────┘  │
│  (Features stacked)           │
├───────────────────────────────┤
│  Ready to get organized?      │
│  [  Create Free Account  ]    │
├───────────────────────────────┤
│  © 2026 Todo  •  [About]      │
└───────────────────────────────┘
```

#### Key Components Used

| Component | Source | Notes |
|-----------|--------|-------|
| Header | `components.md#header` | Public variant (no user menu) |
| Button (Primary) | `components.md#buttons` | CTA buttons |
| Button (Secondary) | `components.md#buttons` | Learn More |
| Feature Card | Custom | Icon + title + description |
| App Preview | Custom | Mockup of task cards |
| Footer | `components.md#footer` | Minimal links |

#### Responsive Breakpoints

| Breakpoint | Layout Changes |
|------------|----------------|
| <640px | Single column, stacked hero, hamburger menu |
| 640-1024px | Two-column hero, 2×3 feature grid |
| >1024px | Full layout as shown, 3×2 feature grid |

---

### 2. Login Page

**Route**: `/login`
**Auth Required**: No (redirects to /dashboard if authenticated)
**Purpose**: Authenticate existing users

#### Desktop Layout (>1024px)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  HEADER (minimal)                                                            │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │  [← Back]  TODO                                                       │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  ┌─────────────────────────────┐ ┌───────────────────────────────────────┐  │
│  │                             │ │                                       │  │
│  │                             │ │   Welcome back                        │  │
│  │     Brand/Illustration      │ │   Sign in to continue to your tasks  │  │
│  │     (Optional decorative    │ │                                       │  │
│  │      element or gradient)   │ │   Email                               │  │
│  │                             │ │   ┌───────────────────────────────┐   │  │
│  │                             │ │   │ you@example.com               │   │  │
│  │                             │ │   └───────────────────────────────┘   │  │
│  │                             │ │                                       │  │
│  │                             │ │   Password                            │  │
│  │                             │ │   ┌───────────────────────────────┐   │  │
│  │                             │ │   │ ••••••••                 [👁]│   │  │
│  │                             │ │   └───────────────────────────────┘   │  │
│  │                             │ │                    Forgot password?   │  │
│  │                             │ │                                       │  │
│  │                             │ │   ┌───────────────────────────────┐   │  │
│  │                             │ │   │          Sign In              │   │  │
│  │                             │ │   └───────────────────────────────┘   │  │
│  │                             │ │                                       │  │
│  │                             │ │   ──────── or continue with ────────  │  │
│  │                             │ │                                       │  │
│  │                             │ │   [  Google  ]    [  GitHub  ]        │  │
│  │                             │ │                                       │  │
│  │                             │ │   Don't have an account? Sign up      │  │
│  │                             │ │                                       │  │
│  └─────────────────────────────┘ └───────────────────────────────────────┘  │
│            40%                                    60%                        │
└─────────────────────────────────────────────────────────────────────────────┘
```

#### Mobile Layout (<640px)

```
┌───────────────────────────────┐
│  [←]  TODO                    │
├───────────────────────────────┤
│                               │
│       Welcome back            │
│  Sign in to your tasks        │
│                               │
│  Email                        │
│  ┌─────────────────────────┐  │
│  │ you@example.com         │  │
│  └─────────────────────────┘  │
│                               │
│  Password                     │
│  ┌─────────────────────────┐  │
│  │ ••••••••            [👁]│  │
│  └─────────────────────────┘  │
│            Forgot password?   │
│                               │
│  ┌─────────────────────────┐  │
│  │       Sign In           │  │
│  └─────────────────────────┘  │
│                               │
│  ───── or continue with ───── │
│                               │
│  [ Google ]    [ GitHub ]     │
│                               │
│  Don't have an account?       │
│         Sign up               │
│                               │
└───────────────────────────────┘
```

#### Key Components Used

| Component | Source | Notes |
|-----------|--------|-------|
| Input | `components.md#input-fields` | Email, password fields |
| Button (Primary) | `components.md#buttons` | Sign In button |
| Button (Secondary) | `components.md#buttons` | OAuth providers |
| Link | `components.md#buttons` | Forgot password, Sign up |
| Password Toggle | Custom | Eye icon to show/hide |

#### Form Behavior

- **Validation**: Handled by Better Auth (no custom Zod schemas)
- **Error States**: Display inline below fields (see components.md#input-fields error state)
- **Loading State**: Button shows spinner during authentication
- **Success**: Redirect to `/dashboard`
- **OAuth Flow**: Redirect to provider, return to `/dashboard`

---

### 3. Signup Page

**Route**: `/signup`
**Auth Required**: No (redirects to /dashboard if authenticated)
**Purpose**: Register new users

#### Desktop Layout (>1024px)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  HEADER (minimal)                                                            │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │  [← Back]  TODO                                                       │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  ┌─────────────────────────────┐ ┌───────────────────────────────────────┐  │
│  │                             │ │                                       │  │
│  │                             │ │   Create your account                 │  │
│  │     Brand/Illustration      │ │   Start organizing your tasks today  │  │
│  │                             │ │                                       │  │
│  │                             │ │   Name                                │  │
│  │                             │ │   ┌───────────────────────────────┐   │  │
│  │                             │ │   │ John Doe                      │   │  │
│  │                             │ │   └───────────────────────────────┘   │  │
│  │                             │ │                                       │  │
│  │                             │ │   Email                               │  │
│  │                             │ │   ┌───────────────────────────────┐   │  │
│  │                             │ │   │ john@example.com              │   │  │
│  │                             │ │   └───────────────────────────────┘   │  │
│  │                             │ │                                       │  │
│  │                             │ │   Password                            │  │
│  │                             │ │   ┌───────────────────────────────┐   │  │
│  │                             │ │   │ ••••••••                 [👁]│   │  │
│  │                             │ │   └───────────────────────────────┘   │  │
│  │                             │ │   ▪▪▪▫▫ Strength: Medium              │  │
│  │                             │ │                                       │  │
│  │                             │ │   ┌───────────────────────────────┐   │  │
│  │                             │ │   │       Create Account          │   │  │
│  │                             │ │   └───────────────────────────────┘   │  │
│  │                             │ │                                       │  │
│  │                             │ │   By signing up, you agree to our    │  │
│  │                             │ │   Terms and Privacy Policy.          │  │
│  │                             │ │                                       │  │
│  │                             │ │   Already have an account? Sign in   │  │
│  │                             │ │                                       │  │
│  └─────────────────────────────┘ └───────────────────────────────────────┘  │
│            40%                                    60%                        │
└─────────────────────────────────────────────────────────────────────────────┘
```

#### Form Fields

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| Name | Text | Yes | Min 2 characters |
| Email | Email | Yes | Valid email format |
| Password | Password | Yes | Min 8 chars (Better Auth default) |

#### Password Strength Indicator

```
Weak:     ▪▫▫▫▫  (red)
Fair:     ▪▪▫▫▫  (orange)
Medium:   ▪▪▪▫▫  (yellow)
Strong:   ▪▪▪▪▫  (lime)
Very Strong: ▪▪▪▪▪ (green)
```

---

### 4. Dashboard

**Route**: `/dashboard`
**Auth Required**: Yes
**Purpose**: Primary task management interface

#### Desktop Layout (>1024px)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  HEADER                                                                      │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │  [Logo] TODO    [🔍 Search tasks...]         [🔔 3]  [John Doe ▾]    │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  GREETING BANNER                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │  Good morning, John!                                                  │  │
│  │  You have 5 tasks remaining today.                                    │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  TABS + ADD BUTTON                                                           │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │  [All (12)]  [Active (5)]  [Completed (7)]           [+ Add Task]    │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  FILTER BAR                                                                  │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │  Filter: [Priority ▾]  [Category ▾]  [Due Date ▾]    Sort: [Date ▾]  │  │
│  │  Active: [High ×]  [Due today ×]                     [Clear all]     │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  TASK LIST                                                                   │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │  Today (3)                                                            │  │
│  │  ┌─────────────────────────────────────────────────────────────────┐  │  │
│  │  │ ○  Complete project proposal                                    │  │  │
│  │  │    [HIGH]  [Work]  Due: Today, 5:00 PM              [⋮]        │  │  │
│  │  └─────────────────────────────────────────────────────────────────┘  │  │
│  │  ┌─────────────────────────────────────────────────────────────────┐  │  │
│  │  │ ○  Review pull requests                                         │  │  │
│  │  │    [MEDIUM]  [Work]  Due: Today                     [⋮]        │  │  │
│  │  └─────────────────────────────────────────────────────────────────┘  │  │
│  │  ┌─────────────────────────────────────────────────────────────────┐  │  │
│  │  │ ○  Buy groceries                                                │  │  │
│  │  │    [LOW]  [Personal]  Due: Today                    [⋮]        │  │  │
│  │  └─────────────────────────────────────────────────────────────────┘  │  │
│  │                                                                       │  │
│  │  Tomorrow (2)                                                         │  │
│  │  ┌─────────────────────────────────────────────────────────────────┐  │  │
│  │  │ ○  Team standup meeting                                         │  │  │
│  │  │    [MEDIUM]  [Work]  Due: Tomorrow, 9:00 AM         [⋮]        │  │  │
│  │  └─────────────────────────────────────────────────────────────────┘  │  │
│  │                                                                       │  │
│  │  Completed (7)                                            [Show ▾]   │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

#### Tablet Layout (640-1024px)

```
┌─────────────────────────────────────────────────────────────┐
│  [Logo] TODO  [🔍]                    [🔔 3]  [JD ▾]        │
├─────────────────────────────────────────────────────────────┤
│  Good morning, John!                                        │
│  5 tasks remaining today.                                   │
├─────────────────────────────────────────────────────────────┤
│  [All]  [Active]  [Done]                    [+ Add Task]    │
├─────────────────────────────────────────────────────────────┤
│  [Priority ▾]  [Category ▾]            Sort: [Date ▾]       │
│  [High ×]  [Due today ×]               [Clear]              │
├─────────────────────────────────────────────────────────────┤
│  Today (3)                                                  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ ○  Complete project proposal                          │  │
│  │    [HIGH]  [Work]  Due: Today, 5:00 PM       [⋮]     │  │
│  └───────────────────────────────────────────────────────┘  │
│  (More tasks...)                                            │
└─────────────────────────────────────────────────────────────┘
```

#### Mobile Layout (<640px)

```
┌───────────────────────────────┐
│  [☰]  TODO   [🔍] [🔔] [JD]   │
├───────────────────────────────┤
│  Good morning, John!          │
│  5 tasks remaining today.     │
├───────────────────────────────┤
│  [All] [Active] [Done]        │
├───────────────────────────────┤
│  [⚙ Filter]     Sort: [▾]     │
├───────────────────────────────┤
│  Today (3)                    │
│  ┌─────────────────────────┐  │
│  │ ○  Complete project     │  │
│  │    proposal             │  │
│  │    [HIGH]  [Work]       │  │
│  │    Due: Today, 5:00 PM  │  │
│  └─────────────────────────┘  │
│  ┌─────────────────────────┐  │
│  │ ○  Review PRs           │  │
│  │    [MEDIUM]  [Work]     │  │
│  │    Due: Today           │  │
│  └─────────────────────────┘  │
│  (More tasks...)              │
├───────────────────────────────┤
│  [        + Add Task        ] │  ← Floating action button
└───────────────────────────────┘
```

#### Key Components Used

| Component | Source | Notes |
|-----------|--------|-------|
| Header | `components.md#header` | Authenticated variant |
| Search Input | `components.md#input-fields` | Quick search |
| Tabs | `components.md#tabs` | All/Active/Completed |
| Filter Bar | `components.md#filter-controls` | Priority, Category, Due Date |
| Task Card | `components.md#task-card` | Checkbox, title, badges, actions |
| Dropdown | `components.md#dropdown` | Sort, filter options |
| Button (Primary) | `components.md#buttons` | Add Task |
| Empty State | `components.md#empty-state` | When no tasks exist |
| User Menu | `components.md#avatar-user-menu` | Profile dropdown |

#### Task Edit Modal

When user clicks "Add Task" or edits an existing task, a modal appears:

```
┌───────────────────────────────────────────────────────────────┐
│                                                               │
│  Add New Task                                            [×]  │
│  ─────────────────────────────────────────────────────────    │
│                                                               │
│  Task Title *                                                 │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ What needs to be done?                                  │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                               │
│  Description (optional)                                       │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │                                                         │  │
│  │                                                         │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                               │
│  ┌─────────────────────────┐  ┌─────────────────────────┐    │
│  │ Priority                │  │ Category                │    │
│  │ [Medium           ▾]    │  │ [Select...         ▾]   │    │
│  └─────────────────────────┘  └─────────────────────────┘    │
│                                                               │
│  Due Date                                                     │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ [📅]  Select date...                                    │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                               │
│  ─────────────────────────────────────────────────────────    │
│                               [Cancel]  [Create Task]         │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

See `components.md#modal-dialog` for modal specifications.

---

### 5. Settings Page

**Route**: `/settings`
**Auth Required**: Yes
**Purpose**: User preferences and account management

#### Desktop Layout (>1024px)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  HEADER                                                                      │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │  [Logo] TODO    [🔍 Search...]              [🔔 3]  [John Doe ▾]      │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  BREADCRUMB                                                                  │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │  ← Back to Dashboard                                      Settings   │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  ┌────────────────────────┐  ┌───────────────────────────────────────────┐  │
│  │  SIDEBAR               │  │  CONTENT AREA                             │  │
│  │                        │  │                                           │  │
│  │  Profile               │  │  Account Information                      │  │
│  │  ─────────────────     │  │                                           │  │
│  │  > Account        ●    │  │  ┌────┐                                  │  │
│  │  > Security            │  │  │ JD │  John Doe                        │  │
│  │  > Notifications       │  │  └────┘  john@example.com                │  │
│  │                        │  │                                           │  │
│  │  Preferences           │  │  [Edit Profile]                          │  │
│  │  ─────────────────     │  │                                           │  │
│  │  > Display             │  │  ───────────────────────────────────────  │  │
│  │  > Categories          │  │                                           │  │
│  │  > Default Sort        │  │  Email                                    │  │
│  │                        │  │  ┌─────────────────────────────────────┐  │  │
│  │  Danger Zone           │  │  │ john@example.com                    │  │  │
│  │  ─────────────────     │  │  └─────────────────────────────────────┘  │  │
│  │  > Delete Account      │  │                                           │  │
│  │                        │  │  [Update Email]                          │  │
│  │                        │  │                                           │  │
│  │                        │  │  ───────────────────────────────────────  │  │
│  │                        │  │                                           │  │
│  │                        │  │  Change Password                          │  │
│  │                        │  │                                           │  │
│  │                        │  │  Current Password                         │  │
│  │                        │  │  ┌─────────────────────────────────────┐  │  │
│  │                        │  │  │ ••••••••                            │  │  │
│  │                        │  │  └─────────────────────────────────────┘  │  │
│  │                        │  │                                           │  │
│  │                        │  │  New Password                             │  │
│  │                        │  │  ┌─────────────────────────────────────┐  │  │
│  │                        │  │  │ ••••••••                            │  │  │
│  │                        │  │  └─────────────────────────────────────┘  │  │
│  │                        │  │                                           │  │
│  │                        │  │  [Update Password]                        │  │
│  │                        │  │                                           │  │
│  └────────────────────────┘  └───────────────────────────────────────────┘  │
│         25%                                   75%                            │
└─────────────────────────────────────────────────────────────────────────────┘
```

#### Mobile Layout (<640px)

```
┌───────────────────────────────┐
│  [←]  Settings                │
├───────────────────────────────┤
│  Profile                      │
│  ┌─────────────────────────┐  │
│  │ > Account               │  │
│  ├─────────────────────────┤  │
│  │ > Security              │  │
│  ├─────────────────────────┤  │
│  │ > Notifications         │  │
│  └─────────────────────────┘  │
│                               │
│  Preferences                  │
│  ┌─────────────────────────┐  │
│  │ > Display               │  │
│  ├─────────────────────────┤  │
│  │ > Categories            │  │
│  ├─────────────────────────┤  │
│  │ > Default Sort          │  │
│  └─────────────────────────┘  │
│                               │
│  Danger Zone                  │
│  ┌─────────────────────────┐  │
│  │ > Delete Account        │  │
│  └─────────────────────────┘  │
└───────────────────────────────┘

(Tapping item navigates to detail page)
```

#### Settings Sections

| Section | Route | Contents |
|---------|-------|----------|
| Account | `/settings/account` | Email, password, profile info |
| Security | `/settings/security` | Two-factor auth (Phase 3+), sessions |
| Notifications | `/settings/notifications` | Email preferences, push settings |
| Display | `/settings/preferences` | Default view, date format |
| Categories | `/settings/categories` | Manage custom categories |
| Delete Account | `/settings/account#danger` | Account deletion with confirmation |

---

### 6. About Page

**Route**: `/about`
**Auth Required**: No
**Purpose**: Project information and architecture showcase for judges

#### Desktop Layout (>1024px)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  HEADER                                                                      │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │  [Logo] TODO                              [About]  [Login] [Sign Up]  │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  HERO                                                                        │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                                                                       │  │
│  │                     About Todo App                                    │  │
│  │          Hackathon II - Evolution of Todo                             │  │
│  │               Spec-Driven Development                                 │  │
│  │                                                                       │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  PROJECT OVERVIEW                                                            │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │  What is this project?                                                │  │
│  │                                                                       │  │
│  │  A Todo application that evolves through 5 phases—from a simple      │  │
│  │  Python CLI to a cloud-native deployment with Dapr and Kafka—        │  │
│  │  demonstrating strict Spec-Driven Development where all code is      │  │
│  │  generated from refined specifications.                               │  │
│  │                                                                       │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  PHASES TIMELINE                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                                                                       │  │
│  │  ○─────────●─────────○─────────○─────────○                            │  │
│  │  Phase 1   Phase 2   Phase 3   Phase 4   Phase 5                     │  │
│  │  CLI       Web App   Chatbot   K8s       Cloud                       │  │
│  │            (Current)                                                  │  │
│  │                                                                       │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  TECH STACK                                                                  │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                │  │
│  │  │   Frontend   │  │   Backend    │  │   Database   │                │  │
│  │  │  Next.js 16  │  │   FastAPI    │  │ PostgreSQL   │                │  │
│  │  │  Tailwind    │  │   SQLModel   │  │   (Neon)     │                │  │
│  │  │  Shadcn UI   │  │   JWT Auth   │  │              │                │  │
│  │  └──────────────┘  └──────────────┘  └──────────────┘                │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  ARCHITECTURE DIAGRAM                                                        │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                                                                       │  │
│  │     Browser                                                           │  │
│  │        │                                                              │  │
│  │        ▼                                                              │  │
│  │   ┌──────────────────────────────────────────┐                       │  │
│  │   │        Next.js Frontend                   │                       │  │
│  │   │   (App Router + TypeScript + Tailwind)    │                       │  │
│  │   └────────────────────┬─────────────────────┘                       │  │
│  │                        │ REST + JWT                                   │  │
│  │                        ▼                                              │  │
│  │   ┌──────────────────────────────────────────┐                       │  │
│  │   │         FastAPI Backend                   │                       │  │
│  │   │    ┌──────────────────────┐               │                       │  │
│  │   │    │    Task Service      │               │                       │  │
│  │   │    └──────────────────────┘               │                       │  │
│  │   └────────────────────┬─────────────────────┘                       │  │
│  │                        │ SQLModel                                     │  │
│  │                        ▼                                              │  │
│  │   ┌──────────────────────────────────────────┐                       │  │
│  │   │     Neon PostgreSQL (Serverless)          │                       │  │
│  │   └──────────────────────────────────────────┘                       │  │
│  │                                                                       │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  TEAM / CREDITS                                                              │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                                                                       │  │
│  │  Built with Claude Code                                               │  │
│  │  Anthropic Hackathon II                                               │  │
│  │  January 2026                                                         │  │
│  │                                                                       │  │
│  │  [View on GitHub]                                                     │  │
│  │                                                                       │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  FOOTER                                                                      │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │  © 2026 Todo App  •  Hackathon II Project  •  [GitHub] [Dashboard]   │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
```

#### Key Sections

| Section | Purpose |
|---------|---------|
| Hero | Project title and tagline |
| Overview | Brief description of the project |
| Phases Timeline | Visual progress indicator (Phase 2 highlighted) |
| Tech Stack | Technology cards showing stack components |
| Architecture | ASCII diagram of system architecture |
| Credits | Team info, hackathon attribution, GitHub link |

---

## Shared Layouts

### Root Layout

Applied to all pages via `app/layout.tsx`:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  <html lang="en" class="dark">                                               │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │  <body class="bg-background-primary text-foreground-primary">         │  │
│  │                                                                       │  │
│  │    {children}                                                         │  │
│  │                                                                       │  │
│  │    <Toaster position="bottom-right" />                               │  │
│  │                                                                       │  │
│  │  </body>                                                              │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│  </html>                                                                     │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Public Layout

Applied to `/`, `/login`, `/signup`, `/about`:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  HEADER (Public variant)                                                     │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │  [Logo] TODO                              [About]  [Login] [Sign Up]  │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  {children}                                                                  │
│                                                                              │
│  FOOTER                                                                      │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │  © 2026 Todo App  •  Hackathon II  •  [GitHub] [About]               │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Protected Layout

Applied to `/dashboard`, `/settings`:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  HEADER (Authenticated variant)                                              │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │  [Logo] TODO    [🔍 Search...]              [🔔 N]  [Username ▾]      │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  {children}                                                                  │
│                                                                              │
│  (No footer on dashboard for maximum task space)                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Navigation Flow

### User Journey Map

```
                              ┌─────────────┐
                              │   Landing   │
                              │     (/)     │
                              └──────┬──────┘
                                     │
            ┌────────────────────────┼────────────────────────┐
            │                        │                        │
            ▼                        ▼                        ▼
     ┌─────────────┐          ┌─────────────┐          ┌─────────────┐
     │    Login    │          │   Signup    │          │    About    │
     │   (/login)  │          │  (/signup)  │          │   (/about)  │
     └──────┬──────┘          └──────┬──────┘          └─────────────┘
            │                        │
            └───────────┬────────────┘
                        │
                        ▼
               ┌─────────────────┐
               │    Dashboard    │ ◄───────────────────┐
               │  (/dashboard)   │                     │
               └────────┬────────┘                     │
                        │                              │
            ┌───────────┼───────────┐                  │
            │           │           │                  │
            ▼           ▼           ▼                  │
     ┌───────────┐ ┌─────────┐ ┌──────────┐           │
     │Task Modal │ │ Search  │ │ Settings │───────────┘
     │ (overlay) │ │(inline) │ │(/settings)│
     └───────────┘ └─────────┘ └──────────┘
```

### Navigation Elements

| Element | Location | Actions |
|---------|----------|---------|
| Logo | Header (left) | Links to `/` (public) or `/dashboard` (auth) |
| Login button | Header (right, public) | Links to `/login` |
| Sign Up button | Header (right, public) | Links to `/signup` |
| User menu | Header (right, auth) | Dropdown with Settings, Sign Out |
| Notifications | Header (right, auth) | Opens notification panel |
| Search | Header (center, auth) | Inline search or expands |
| Back arrow | Auth/Settings pages | Returns to previous page |

---

## Authentication Guards

### Route Protection Matrix

| Route Pattern | Auth Required | Redirect If |
|---------------|---------------|-------------|
| `/` | No | N/A |
| `/login` | No | → `/dashboard` if authenticated |
| `/signup` | No | → `/dashboard` if authenticated |
| `/about` | No | N/A |
| `/dashboard` | Yes | → `/login` if unauthenticated |
| `/settings/**` | Yes | → `/login` if unauthenticated |

### Session Management

- **Session Provider**: Wraps protected layout
- **Session Check**: Client-side via Better Auth hooks
- **Loading State**: Skeleton UI while checking auth
- **Expiry Handling**: Redirect to login with return URL

### Redirect Behavior

```
Unauthenticated user visits /dashboard
  └─► Redirect to /login?redirect=/dashboard
      └─► After successful login
          └─► Redirect to /dashboard (from query param)

Authenticated user visits /login
  └─► Redirect to /dashboard
```

---

## Progressive Enhancement (Phase 3+)

### Chatbot Widget (Phase 3)

Reserved space for floating chat widget:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                              │
│                          (Dashboard content)                                 │
│                                                                              │
│                                                                              │
│                                                          ┌───────────────┐  │
│                                                          │ 💬            │  │
│                                                          └───────────────┘  │
│  Position: fixed, bottom-right, 24px offset                                 │
│  Expands to chat panel on click                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Real-Time Indicators (Phase 3+)

- **Notification badge**: Live count updates
- **Task sync indicator**: Subtle pulse when syncing
- **Collaborative indicators**: User presence (future)

### Voice Input (Phase 3+)

- **Microphone button**: In task creation modal
- **Voice command**: "Add task: buy groceries tomorrow"

---

## User Scenarios & Testing

### User Story 1 - New Visitor Discovers App (Priority: P1)

A first-time visitor lands on the home page, understands the product value, and signs up for an account.

**Why this priority**: Core conversion funnel - must work flawlessly for user acquisition.

**Independent Test**: Navigate to `/`, read content, click "Get Started", complete signup, verify redirect to dashboard.

**Acceptance Scenarios**:

1. **Given** a user visits the landing page, **When** the page loads, **Then** they see a clear value proposition, feature highlights, and prominent CTA buttons.
2. **Given** a user clicks "Get Started Free", **When** the signup page loads, **Then** the form is focused on the name field and clearly shows required fields.
3. **Given** a user completes signup, **When** submission succeeds, **Then** they are redirected to `/dashboard` with a welcome message.

---

### User Story 2 - Returning User Signs In (Priority: P1)

An existing user visits the app, signs in, and accesses their tasks.

**Why this priority**: Returning users are the primary user base - login must be seamless.

**Independent Test**: Navigate to `/login`, enter credentials, verify successful authentication and dashboard access.

**Acceptance Scenarios**:

1. **Given** a user visits `/login`, **When** the page loads, **Then** the email field is focused and OAuth options are visible.
2. **Given** a user enters valid credentials, **When** they click "Sign In", **Then** they see a loading state and are redirected to `/dashboard`.
3. **Given** an authenticated user visits `/login`, **When** the page loads, **Then** they are automatically redirected to `/dashboard`.

---

### User Story 3 - User Manages Tasks on Dashboard (Priority: P1)

An authenticated user views, creates, edits, and completes tasks on the dashboard.

**Why this priority**: Core functionality - task management is the app's primary value.

**Independent Test**: Login, view tasks, add new task via modal, mark task complete, filter by priority.

**Acceptance Scenarios**:

1. **Given** a user is on the dashboard with tasks, **When** they view the page, **Then** tasks are grouped by due date with priority badges visible.
2. **Given** a user clicks "Add Task", **When** the modal opens, **Then** the title field is focused and they can set priority, category, and due date.
3. **Given** a user checks a task checkbox, **When** the task is marked complete, **Then** it moves to the "Completed" section with strikethrough styling.
4. **Given** a user selects a priority filter, **When** the filter is applied, **Then** only tasks matching that priority are shown.

---

### User Story 4 - User Updates Settings (Priority: P2)

An authenticated user accesses settings to update their profile or preferences.

**Why this priority**: Important for user retention but not critical path.

**Independent Test**: Login, navigate to settings, update email, save changes, verify update persists.

**Acceptance Scenarios**:

1. **Given** a user clicks their avatar/name, **When** the dropdown appears, **Then** "Settings" is a visible option.
2. **Given** a user is on the settings page, **When** they view the sidebar, **Then** they see organized categories (Profile, Preferences, Danger Zone).
3. **Given** a user updates their email, **When** they save changes, **Then** a success toast appears and the new email is displayed.

---

### User Story 5 - Visitor Explores About Page (Priority: P3)

A visitor or authenticated user views the About page to learn about the project.

**Why this priority**: Valuable for judges but not core user flow.

**Independent Test**: Navigate to `/about`, verify all sections render correctly.

**Acceptance Scenarios**:

1. **Given** a user visits `/about`, **When** the page loads, **Then** they see project overview, phase timeline, tech stack, and architecture diagram.
2. **Given** a user views the phase timeline, **When** Phase 2 is displayed, **Then** it is visually highlighted as the current phase.

---

### User Story 6 - Responsive Layout Adaptation (Priority: P2)

A user accesses the app on different devices and the layout adapts appropriately.

**Why this priority**: Professional presentation across devices is essential for judges.

**Independent Test**: Resize browser through breakpoints, verify layout changes match specifications.

**Acceptance Scenarios**:

1. **Given** a user views the dashboard on mobile (<640px), **When** the page loads, **Then** the filter bar collapses to an icon, task cards stack vertically, and a floating action button appears.
2. **Given** a user views the settings page on mobile, **When** the page loads, **Then** the sidebar becomes a stacked menu that navigates to detail pages.

---

### Edge Cases

- What happens when a user navigates to a protected route while unauthenticated?
  - Redirect to `/login` with return URL preserved as query parameter
- What happens when a session expires while the user is on the dashboard?
  - Toast notification appears, user is redirected to login with return URL
- What happens when a user tries to access `/login` while already authenticated?
  - Immediate redirect to `/dashboard`
- How does the app handle deep links to settings sub-pages?
  - Direct navigation works if authenticated; redirect to login with return URL if not
- What happens on a 404 route?
  - Display friendly 404 page with link back to home/dashboard

---

## Requirements

### Functional Requirements

- **FR-001**: System MUST display 6 distinct pages (Landing, Login, Signup, Dashboard, Settings, About) with layouts matching specifications
- **FR-002**: System MUST redirect unauthenticated users from protected routes (/dashboard, /settings) to /login with return URL preserved
- **FR-003**: System MUST redirect authenticated users from /login and /signup to /dashboard
- **FR-004**: Dashboard MUST display tasks grouped by due date (Today, Tomorrow, Later, Completed) with all specified metadata
- **FR-005**: Task edit modal MUST appear as an overlay on the dashboard without page navigation
- **FR-006**: Settings page MUST display sidebar navigation on desktop and stacked navigation on mobile
- **FR-007**: All pages MUST adapt layout at defined breakpoints (<640px, 640-1024px, >1024px)
- **FR-008**: Navigation header MUST switch between public variant (Login/Signup buttons) and authenticated variant (User menu)
- **FR-009**: About page MUST display project information, phase timeline, tech stack, and architecture diagram
- **FR-010**: All forms MUST display loading states during submission and error states on failure

### Key Entities

- **Page**: A distinct URL-accessible view with specific layout and content
- **Layout**: Shared structural wrapper applied to groups of pages (public, protected)
- **Route Guard**: Middleware that controls access based on authentication state
- **Modal**: Overlay component that appears on top of current page without navigation

---

## Success Criteria

### Measurable Outcomes

- **SC-001**: Users can navigate from landing page to dashboard in 3 clicks or fewer (visit → signup → submit → dashboard)
- **SC-002**: All 6 pages render without layout errors on viewports from 320px to 2560px width
- **SC-003**: Protected routes redirect unauthenticated users to login within 100ms
- **SC-004**: Return URL parameter correctly restores intended destination after authentication 100% of the time
- **SC-005**: Page layouts match ASCII specifications with less than 5% visual deviation
- **SC-006**: Judges can identify all major app sections and navigation paths from this document without additional mockups
- **SC-007**: All pages achieve Lighthouse accessibility score of 90+ (WCAG AA compliance)
- **SC-008**: Task modal opens within 200ms of clicking "Add Task" button

---

## Assumptions

1. **Better Auth Integration**: Authentication forms use Better Auth components, not custom implementations
2. **Session Persistence**: Sessions persist across page reloads via cookies/localStorage
3. **No SSR Auth**: Auth state is checked client-side; no server-side session validation on initial render
4. **Mobile-First CSS**: Styles are written mobile-first with progressive enhancement for larger screens
5. **Single User Session**: No multi-device session management in Phase 2
6. **English Only**: UI is in English with no i18n support in Phase 2

---

## Implementation Notes

### File Structure Reference

```
app/
├── (public)/
│   ├── layout.tsx          # Public header/footer
│   ├── page.tsx             # Landing page
│   ├── login/page.tsx       # Login page
│   ├── signup/page.tsx      # Signup page
│   └── about/page.tsx       # About page
├── (protected)/
│   ├── layout.tsx           # Auth check, authenticated header
│   ├── dashboard/page.tsx   # Dashboard
│   └── settings/
│       ├── page.tsx         # Settings index
│       └── [section]/page.tsx # Settings sub-pages
├── layout.tsx               # Root layout (theme, fonts, toaster)
└── not-found.tsx            # 404 page
```

### Component Dependencies

| Page | Required Components from components.md |
|------|----------------------------------------|
| Landing | Header, Button, Footer |
| Login | Header, Input, Button, Link |
| Signup | Header, Input, Button, Link |
| Dashboard | Header, Search, Tabs, FilterBar, TaskCard, Modal, Button, EmptyState, UserMenu |
| Settings | Header, Sidebar, Input, Button, Avatar |
| About | Header, Footer, Cards |

### Animation Notes (Framer Motion)

| Transition | Animation |
|------------|-----------|
| Page navigation | Fade in (opacity 0→1, 200ms) |
| Modal open | Fade + scale (95%→100%, 200ms) |
| Modal close | Fade + scale (100%→95%, 150ms) |
| Task complete | Checkbox bounce, row slide out |
| Toast appear | Slide in from right |

---

*Specification created: 2026-01-22*
*Phase: 2 (Web Application)*
*Constitution Reference: `.specify/memory/constitution.md` v1.1.0*
*Component Reference: [specs/ui/components.md](./components.md)*

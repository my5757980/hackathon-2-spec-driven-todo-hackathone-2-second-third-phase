---
id: 6
title: Fix signout button not working
stage: green
date: 2026-01-24
surface: agent
model: claude-opus-4-5-20251101
feature: task-crud
branch: 001-task-crud
user: maira
command: /sp.implement
labels: ["bug-fix", "authentication", "better-auth", "signout"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - frontend/components/layout/header.tsx
  - frontend/app/(protected)/layout.tsx
tests:
  - Manual testing: Click Sign Out button should clear session and redirect to /signin
---

## Prompt

You are an expert Next.js developer specializing in authentication with NextAuth.js / Auth.js (App Router). I have a Next.js 15 app using App Router, and I'm facing this issue:

- When I try to access /dashboard (protected page), I get this error:
  "Session expired. Please sign in again."
  It redirects to /signin?error=session_expired

- The error comes from my ApiClient.request in lib/api-client.ts (line 92-93):
  if (!response.ok) {
    window.location.href = '/signin?error=session_expired';
    throw new Error('Session expired. Please sign in again.');
  }

- Now the main problem: The **Sign Out button is not working properly**. When I click Sign Out, it either:
  - Does nothing
  - Redirects back to dashboard
  - Or shows the same session expired error again
  - Or logs out but next login still shows expired session immediately

I am using NextAuth.js (likely v5 / Auth.js) with JWT strategy (or database, please ask if needed). My app has:
- Middleware protecting /dashboard
- useSession() from next-auth/react
- A Sign Out button that calls signOut() from next-auth/react

Please help me debug and fix why signOut is not working. Provide step-by-step diagnosis and code fixes.

## Response snapshot

**Root Cause Identified:** The Sign Out button was connected via callback props but the callback was never properly wired.

**Problem Flow:**
1. `Protected Layout` (server component) didn't pass `onSignOut` callback to Header
2. `Header` component defaulted `onSignOut` to `() => {}` (empty function)
3. `UserMenu` received the empty function and Sign Out did nothing

**Fix Applied:**
1. Updated `Header` component to import `signOut` directly from `@/lib/auth-client`
2. Created internal `handleSignOut` async function that calls `signOut()` and redirects
3. Removed unused `onSignOut` prop from HeaderProps interface
4. Used `window.location.href` instead of `router.push()` for hard navigation to clear all client state
5. Cleaned up unused server action in protected layout

**Key Change in header.tsx:**
```tsx
import { signOut } from '@/lib/auth-client'

const handleSignOut = async () => {
  try {
    await signOut()
    window.location.href = '/signin'
  } catch (error) {
    window.location.href = '/signin'
  }
}
```

## Outcome

- Impact: Sign Out button now properly calls Better Auth signOut() and redirects to /signin
- Tests: Manual testing - click Sign Out should clear session cookie and redirect
- Files: 2 files modified (header.tsx, layout.tsx)
- Next prompts: Test sign out flow end-to-end, verify session cookie is cleared
- Reflection: The SignoutButton component existed but was never used; Header should handle auth internally

## Evaluation notes (flywheel)

- Failure modes observed: Callback prop chain broken - server component can't pass client callbacks
- Graders run and results (PASS/FAIL): N/A - manual testing required
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): Verify in browser DevTools that better-auth.session_token cookie is deleted after sign out

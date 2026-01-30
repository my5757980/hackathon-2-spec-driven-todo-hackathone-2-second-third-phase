// Generated from @specs/features/authentication/spec.md
/**
 * Next.js middleware for route protection.
 * Redirects unauthenticated users to signin page.
 */
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Routes that require authentication
const protectedRoutes = ['/dashboard', '/settings', '/tasks']

// Routes that should redirect to dashboard if already authenticated
const authRoutes = ['/signin', '/signup']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check for session cookie (Better Auth uses 'better-auth.session_token')
  const sessionToken = request.cookies.get('better-auth.session_token')?.value

  const isAuthenticated = !!sessionToken
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  )
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route))

  // Redirect authenticated users away from auth pages
  if (isAuthRoute && isAuthenticated) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Redirect unauthenticated users to signin
  if (isProtectedRoute && !isAuthenticated) {
    const signinUrl = new URL('/signin', request.url)
    // Add the attempted URL as a redirect parameter
    signinUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(signinUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    // Match all paths except static files, api routes, and _next
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*$).*)',
  ],
}

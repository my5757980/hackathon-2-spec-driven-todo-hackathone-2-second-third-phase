// Generated from @specs/features/authentication/spec.md
/**
 * Better Auth client-side configuration.
 * Used in client components for authentication actions.
 *
 * IMPORTANT: Better Auth endpoints are hosted on the Next.js frontend,
 * NOT the FastAPI backend. Use NEXT_PUBLIC_BETTER_AUTH_URL or default
 * to the frontend origin (not NEXT_PUBLIC_API_URL which points to FastAPI).
 *
 * JWT tokens for backend API calls are fetched via a custom API route
 * that generates HS256 tokens using the shared secret.
 *
 * Updated: 2026-01-29
 * - Added debug logging for token fetch
 * - Improved error handling
 * - Added token caching in getJwtToken
 */
import { createAuthClient } from 'better-auth/react'

// Debug flag - enable in dev or when NEXT_PUBLIC_DEBUG_AUTH is set
const DEBUG = process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_DEBUG_AUTH === 'true'

function log(...args: any[]) {
  if (DEBUG) {
    console.log('[Auth Client]', ...args)
  }
}

// Determine the base URL for Better Auth
// In browser, ALWAYS use window.location.origin so that preview deployments
// and production deployments both work (each Vercel deployment gets a unique URL)
function getBetterAuthBaseURL(): string {
  // In browser, always use current origin - this ensures every deployment works
  if (typeof window !== 'undefined') {
    return window.location.origin
  }

  // Server-side: use env var
  const envUrl = process.env.NEXT_PUBLIC_BETTER_AUTH_URL
  if (envUrl && envUrl.trim() !== '') {
    return envUrl
  }

  return 'http://localhost:3000'
}

// Log the resolved URL on module load (helps debug production issues)
if (typeof window !== 'undefined') {
  console.log('[Auth Client] Using base URL:', window.location.origin)
}

const betterAuthBaseURL = getBetterAuthBaseURL()
log('Better Auth base URL:', betterAuthBaseURL)

export const authClient = createAuthClient({
  // Better Auth API routes are on the Next.js frontend, not the FastAPI backend
  baseURL: betterAuthBaseURL,
  // NOTE: jwtClient plugin removed to avoid JWKS dependency.
  // Use getJwtToken() which calls our custom /api/auth/jwt endpoint.
})

// Export convenient hooks and functions
export const {
  signIn,
  signUp,
  signOut,
  useSession,
  getSession,
} = authClient

// Token cache for getJwtToken
let cachedJwtToken: string | null = null
let tokenFetchTime: number | null = null
const TOKEN_CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

/**
 * Clear the JWT token cache.
 * Call this after signOut to ensure fresh token on next login.
 */
export function clearJwtTokenCache(): void {
  log('Clearing JWT token cache')
  cachedJwtToken = null
  tokenFetchTime = null
}

/**
 * Get a JWT token for authenticating with the backend API.
 * This token should be attached as a Bearer token in the Authorization header.
 *
 * Fetches token from our custom /api/auth/jwt endpoint which generates
 * HS256 tokens using the shared BETTER_AUTH_SECRET.
 *
 * @param forceRefresh - If true, bypass cache and fetch a new token
 * @returns Promise<string | null> The JWT token or null if not authenticated
 */
export async function getJwtToken(forceRefresh = false): Promise<string | null> {
  // Return cached token if still valid
  if (!forceRefresh && cachedJwtToken && tokenFetchTime) {
    const age = Date.now() - tokenFetchTime
    if (age < TOKEN_CACHE_DURATION) {
      log('Using cached JWT token (age:', Math.round(age / 1000), 's)')
      return cachedJwtToken
    }
    log('Cached token expired, fetching new one')
  }

  try {
    // Use the same base URL logic as the auth client
    const baseUrl = getBetterAuthBaseURL()
    log('Fetching JWT token from:', baseUrl + '/api/auth/jwt')

    const response = await fetch(`${baseUrl}/api/auth/jwt`, {
      method: 'GET',
      credentials: 'include', // Include session cookies
      headers: {
        'Accept': 'application/json',
      },
    })

    if (!response.ok) {
      if (response.status === 401) {
        log('Not authenticated (401), no JWT token available')
        cachedJwtToken = null
        tokenFetchTime = null
        return null
      }
      console.error('[Auth Client] Failed to get JWT token:', response.status, response.statusText)
      return null
    }

    const data = await response.json()
    if (data.token) {
      log('JWT token obtained successfully')
      cachedJwtToken = data.token
      tokenFetchTime = Date.now()
      return data.token
    }

    log('No token in response')
    return null
  } catch (error) {
    console.error('[Auth Client] Error fetching JWT token:', error)
    return null
  }
}

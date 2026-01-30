// Generated from @specs/features/authentication/spec.md
/**
 * Better Auth API route handler.
 * Handles all authentication endpoints: signup, signin, signout, session.
 */
import { auth } from '@/lib/auth'
import { toNextJsHandler } from 'better-auth/next-js'

export const { GET, POST } = toNextJsHandler(auth)

// Generated from @specs/features/authentication/spec.md
/**
 * Custom JWT endpoint for generating HS256 tokens for backend API authentication.
 *
 * This endpoint generates JWT tokens using the shared BETTER_AUTH_SECRET,
 * avoiding the need for the JWKS table that the Better Auth JWT plugin requires.
 *
 * The token contains:
 * - sub: user ID
 * - iat: issued at timestamp
 * - exp: expiration (7 days)
 * - iss/aud: base URL
 */
import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { auth, generateJwtToken } from '@/lib/auth'

export async function GET() {
  try {
    // Get the current session using Better Auth
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    // Generate a JWT token using HS256 with the shared secret
    const token = await generateJwtToken(session.user.id)

    return NextResponse.json({ token })
  } catch (error) {
    console.error('[JWT Endpoint] Error generating token:', error)
    return NextResponse.json(
      { error: 'Failed to generate token' },
      { status: 500 }
    )
  }
}

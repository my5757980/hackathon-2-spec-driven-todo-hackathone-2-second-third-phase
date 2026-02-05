// Generated from @specs/features/authentication/spec.md
/**
 * Better Auth server-side configuration.
 * Handles authentication on the server side for Next.js API routes.
 * Uses shared Neon PostgreSQL database for user persistence.
 *
 * JWT tokens for backend API calls are generated using HS256 with
 * the shared BETTER_AUTH_SECRET (no JWKS/database dependency).
 */
import { betterAuth } from 'better-auth'
import { Pool } from 'pg'
import * as jose from 'jose'

// Create PostgreSQL connection pool for Better Auth
// Uses the same Neon database as the backend
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

// Get the base URL for Better Auth server-side
// VERCEL_URL is automatically set by Vercel, use it if BETTER_AUTH_URL is not set
function getServerBetterAuthURL(): string {
  if (process.env.BETTER_AUTH_URL) {
    return process.env.BETTER_AUTH_URL
  }
  // Vercel sets VERCEL_URL without protocol, so add https://
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }
  return 'http://localhost:3000'
}

export const auth = betterAuth({
  // PostgreSQL database adapter using pg Pool
  database: pool,

  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: getServerBetterAuthURL(),

  // Email/password authentication
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
  },

  // NOTE: JWT plugin removed to avoid JWKS table dependency.
  // We use custom HS256 JWT generation via generateJwtToken() below.

  // Session configuration with field mappings for PostgreSQL
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days in seconds
    updateAge: 60 * 60 * 24, // Update session every 24 hours
    fields: {
      expiresAt: 'expires_at',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      userId: 'user_id',
      ipAddress: 'ip_address',
      userAgent: 'user_agent',
    },
  },

  // Map field names to snake_case database columns (PostgreSQL convention)
  user: {
    fields: {
      emailVerified: 'email_verified',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  },
  account: {
    fields: {
      accountId: 'account_id',
      providerId: 'provider_id',
      userId: 'user_id',
      accessToken: 'access_token',
      refreshToken: 'refresh_token',
      idToken: 'id_token',
      accessTokenExpiresAt: 'access_token_expires_at',
      refreshTokenExpiresAt: 'refresh_token_expires_at',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  },
})

// Export types for use in components
export type Session = typeof auth.$Infer.Session
export type User = typeof auth.$Infer.Session.user

/**
 * Generate a JWT token for backend API authentication using HS256.
 * Uses the shared BETTER_AUTH_SECRET for signing.
 *
 * @param userId - The user's ID to include in the 'sub' claim
 * @returns The signed JWT token string
 */
export async function generateJwtToken(userId: string): Promise<string> {
  const secret = process.env.BETTER_AUTH_SECRET
  if (!secret) {
    throw new Error('BETTER_AUTH_SECRET is not configured')
  }

  const secretKey = new TextEncoder().encode(secret)
  const baseUrl = getServerBetterAuthURL()

  const token = await new jose.SignJWT({ sub: userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setIssuer(baseUrl)
    .setAudience(baseUrl)
    .setExpirationTime('7d')
    .sign(secretKey)

  return token
}

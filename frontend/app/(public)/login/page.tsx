// Generated from @specs/ui/pages.md
/**
 * Login page - authenticate existing users.
 * Public route, redirects to dashboard if already authenticated.
 *
 * Updated: 2026-01-29
 * - Added session_expired query param handling
 * - Wrapped searchParams access in Suspense boundary
 */
'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Eye, EyeOff, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { authClient } from '@/lib/auth-client'
import { useToast } from '@/components/ui/toast'

/**
 * Parse Better Auth signin error and return user-friendly message
 */
function parseSignInError(error: any): string {
  if (typeof error === 'string') {
    return error
  }

  if (error?.message) {
    const message = error.message.toLowerCase()

    // Invalid credentials
    if (message.includes('invalid') || message.includes('incorrect') || message.includes('wrong')) {
      return 'Invalid email or password. Please check your credentials and try again.'
    }

    // Account not found
    if (message.includes('not found') || message.includes('does not exist')) {
      return 'No account found with this email. Please sign up first.'
    }

    // Account locked/disabled
    if (message.includes('locked') || message.includes('disabled') || message.includes('suspended')) {
      return 'Your account has been disabled. Please contact support for assistance.'
    }

    // Email verification required
    if (message.includes('verify') || message.includes('verification')) {
      return 'Please verify your email address before signing in.'
    }

    return error.message
  }

  // Network errors - "Failed to fetch" typically means CORS or network issue
  if (error?.name === 'TypeError' || error?.message?.toLowerCase().includes('fetch')) {
    return 'Unable to connect to authentication server. This may be a temporary issue - please try again.'
  }

  // Check for the exact "Failed to fetch" message
  if (typeof error?.message === 'string' && error.message.toLowerCase().includes('failed to fetch')) {
    return 'Connection error. Please check your internet connection and try again.'
  }

  return 'Failed to sign in. Please try again.'
}

// Inner component that uses searchParams - must be wrapped in Suspense
function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { addToast } = useToast()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Check for session_expired flag on mount
  useEffect(() => {
    const sessionExpired = searchParams.get('session_expired')
    if (sessionExpired === 'true') {
      addToast('Your session has expired. Please sign in again.', 'warning')
      setError('Your session has expired. Please sign in again.')
      // Clear the URL param
      window.history.replaceState({}, '', '/login')
    }
  }, [searchParams, addToast])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      console.log('[Login] Attempting signin with email:', email)

      const result = await authClient.signIn.email({
        email,
        password,
      })

      if (result.error) {
        console.error('[Login] Better Auth error:', result.error)
        const errorMsg = parseSignInError(result.error)
        setError(errorMsg)
        addToast(errorMsg, 'error')
        setLoading(false)
        return
      }

      // Success - session is established
      console.log('[Login] Signin successful, session established')
      addToast('Welcome back! Redirecting to your dashboard...', 'success')

      // Small delay to allow session cookie to be set, then redirect
      // Using window.location for a full page load to ensure session is picked up
      setTimeout(() => {
        console.log('[Login] Redirecting to dashboard...')
        window.location.href = '/dashboard'
      }, 500)
    } catch (err) {
      console.error('[Login] Unexpected error:', err)
      const errorMsg = parseSignInError(err)
      setError(errorMsg)
      addToast(errorMsg, 'error')
      setLoading(false)
    }
  }

  const handleOAuthSignIn = async (provider: 'google' | 'github') => {
    try {
      console.log(`[Login] Attempting OAuth signin with ${provider}`)
      await authClient.signIn.social({
        provider,
        callbackURL: '/dashboard',
      })
    } catch (err) {
      console.error(`[Login] OAuth signin failed with ${provider}:`, err)
      const errorMsg = `Failed to sign in with ${provider}. Please try again.`
      setError(errorMsg)
      addToast(errorMsg, 'error')
    }
  }

  return (
    <div className="min-h-[calc(100vh-8rem)] flex">
      {/* Left: Decorative panel (desktop only) */}
      <div className="hidden lg:flex lg:w-2/5 bg-gradient-to-br from-[#3b82f6]/20 to-[#0a0a0b] items-center justify-center p-12">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-[#fafafa] mb-4">
            Welcome back
          </h2>
          <p className="text-[#a1a1aa]">
            Sign in to continue managing your tasks and stay productive.
          </p>
        </div>
      </div>

      {/* Right: Login form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md space-y-8">
          {/* Back link */}
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-[#71717a] hover:text-[#fafafa] transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>

          {/* Header */}
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-[#fafafa]">Welcome back</h1>
            <p className="text-[#a1a1aa]">Sign in to continue to your tasks</p>
          </div>

          {/* Error message */}
          {error && (
            <div className="bg-[#ef4444]/10 border border-[#ef4444]/20 text-[#ef4444] px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-[#fafafa]">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-[#fafafa]">
                  Password
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#71717a] hover:text-[#fafafa] transition-colors"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <div className="text-right">
                  <Link
                    href="/forgot-password"
                    className="text-sm text-[#3b82f6] hover:text-[#2563eb] transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#27272a]" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-[#0a0a0b] px-2 text-[#71717a]">or continue with</span>
            </div>
          </div>

          {/* OAuth buttons */}
          <div className="grid grid-cols-2 gap-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => handleOAuthSignIn('google')}
            >
              Google
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => handleOAuthSignIn('github')}
            >
              GitHub
            </Button>
          </div>

          {/* Sign up link */}
          <p className="text-center text-sm text-[#a1a1aa]">
            Don't have an account?{' '}
            <Link
              href="/signup"
              className="text-[#3b82f6] hover:text-[#2563eb] font-medium transition-colors"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}


// Add this at the very end of the file (after LoginForm component closes)

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-[#a1a1aa]">Loading...</div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}
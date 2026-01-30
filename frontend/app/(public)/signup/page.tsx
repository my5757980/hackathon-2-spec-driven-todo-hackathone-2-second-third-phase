// Generated from @specs/ui/pages.md
/**
 * Signup page - register new users.
 * Public route, redirects to dashboard if already authenticated.
 */
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { authClient } from '@/lib/auth-client'
import { useToast } from '@/components/ui/toast'

function getPasswordStrength(password: string): { score: number; label: string; color: string } {
  let score = 0

  if (password.length >= 8) score++
  if (password.length >= 12) score++
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++
  if (/\d/.test(password)) score++
  if (/[^a-zA-Z0-9]/.test(password)) score++

  const levels = [
    { label: 'Weak', color: '#ef4444' },
    { label: 'Fair', color: '#f59e0b' },
    { label: 'Medium', color: '#eab308' },
    { label: 'Strong', color: '#84cc16' },
    { label: 'Very Strong', color: '#22c55e' },
  ]

  const index = Math.min(score, 4)
  return { score: index + 1, ...levels[index] }
}

/**
 * Parse Better Auth error and return user-friendly message
 */
function parseAuthError(error: any): string {
  // Check for common error patterns
  if (typeof error === 'string') {
    return error
  }

  // Better Auth validation errors
  if (error?.message) {
    const message = error.message.toLowerCase()

    // Email already exists
    if (message.includes('email') && (message.includes('exists') || message.includes('already') || message.includes('duplicate'))) {
      return 'This email is already registered. Please sign in or use a different email.'
    }

    // Password validation
    if (message.includes('password')) {
      if (message.includes('length') || message.includes('8')) {
        return 'Password must be at least 8 characters long.'
      }
      if (message.includes('weak') || message.includes('strength')) {
        return 'Password is too weak. Please use a stronger password with letters, numbers, and symbols.'
      }
      return 'Invalid password. Please check the requirements and try again.'
    }

    // Email validation
    if (message.includes('email') && (message.includes('invalid') || message.includes('format'))) {
      return 'Invalid email format. Please enter a valid email address.'
    }

    // Name validation
    if (message.includes('name') && (message.includes('required') || message.includes('empty'))) {
      return 'Name is required. Please enter your name.'
    }

    // Return the original message if we can't parse it
    return error.message
  }

  // Network errors
  if (error?.name === 'TypeError' && error?.message?.includes('fetch')) {
    return 'Unable to connect to server. Please check your internet connection and try again.'
  }

  // Default fallback
  return 'Failed to create account. Please try again.'
}

export default function SignupPage() {
  const router = useRouter()
  const { addToast } = useToast()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const passwordStrength = getPasswordStrength(password)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    // Client-side validation
    if (password.length < 8) {
      const errorMsg = 'Password must be at least 8 characters'
      setError(errorMsg)
      addToast(errorMsg, 'error')
      setLoading(false)
      return
    }

    if (!name.trim()) {
      const errorMsg = 'Please enter your name'
      setError(errorMsg)
      addToast(errorMsg, 'error')
      setLoading(false)
      return
    }

    try {
      console.log('[Signup] Attempting signup with email:', email)

      const result = await authClient.signUp.email({
        email,
        password,
        name,
      })

      if (result.error) {
        console.error('[Signup] Better Auth error:', result.error)
        const errorMsg = parseAuthError(result.error)
        setError(errorMsg)
        addToast(errorMsg, 'error')
        setLoading(false)
        return
      }

      // Success - session is established, now redirect
      console.log('[Signup] Account created successfully, session established')
      addToast('Account created successfully! Welcome aboard.', 'success')

      // Small delay to allow session cookie to be set, then redirect
      // Using window.location for a full page load to ensure session is picked up
      setTimeout(() => {
        console.log('[Signup] Redirecting to dashboard...')
        window.location.href = '/dashboard'
      }, 500)
    } catch (err) {
      console.error('[Signup] Unexpected error:', err)
      const errorMsg = parseAuthError(err)
      setError(errorMsg)
      addToast(errorMsg, 'error')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-8rem)] flex">
      {/* Left: Decorative panel (desktop only) */}
      <div className="hidden lg:flex lg:w-2/5 bg-gradient-to-br from-[#22c55e]/20 to-[#0a0a0b] items-center justify-center p-12">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-[#fafafa] mb-4">
            Start your journey
          </h2>
          <p className="text-[#a1a1aa]">
            Join thousands of users who are staying organized and productive.
          </p>
        </div>
      </div>

      {/* Right: Signup form */}
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
            <h1 className="text-2xl font-bold text-[#fafafa]">Create your account</h1>
            <p className="text-[#a1a1aa]">Start organizing your tasks today</p>
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
                <label htmlFor="name" className="text-sm font-medium text-[#fafafa]">
                  Name
                </label>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  autoComplete="name"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-[#fafafa]">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john@example.com"
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
                    placeholder="Create a strong password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="new-password"
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

                {/* Password strength indicator */}
                {password && (
                  <div className="space-y-1.5">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div
                          key={i}
                          className="h-1 flex-1 rounded-full transition-colors"
                          style={{
                            backgroundColor: i <= passwordStrength.score ? passwordStrength.color : '#27272a',
                          }}
                        />
                      ))}
                    </div>
                    <p className="text-xs" style={{ color: passwordStrength.color }}>
                      Strength: {passwordStrength.label}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Creating account...' : 'Create Account'}
            </Button>
          </form>

          {/* Terms */}
          <p className="text-xs text-center text-[#71717a]">
            By signing up, you agree to our{' '}
            <Link href="/terms" className="text-[#3b82f6] hover:underline">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link href="/privacy" className="text-[#3b82f6] hover:underline">
              Privacy Policy
            </Link>
            .
          </p>

          {/* Sign in link */}
          <p className="text-center text-sm text-[#a1a1aa]">
            Already have an account?{' '}
            <Link
              href="/login"
              className="text-[#3b82f6] hover:text-[#2563eb] font-medium transition-colors"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

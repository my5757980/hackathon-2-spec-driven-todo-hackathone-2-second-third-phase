// Generated from @specs/features/authentication/spec.md
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { signUp } from '@/lib/auth-client'

export function SignupForm() {
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
    const confirmPassword = formData.get('confirmPassword') as string

    // Client-side validation
    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      setLoading(false)
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    try {
      const result = await signUp.email({
        email,
        password,
        name: email.split('@')[0], // Use email prefix as name
      })

      if (result.error) {
        // Log full error for debugging (check browser console)
        console.error('Signup error:', result.error)

        // Map specific error codes to user-friendly messages
        const errorCode = result.error.code
        if (errorCode === 'USER_ALREADY_EXISTS') {
          setError('An account with this email already exists. Please sign in instead.')
        } else if (errorCode === 'INVALID_EMAIL') {
          setError('Please enter a valid email address.')
        } else if (errorCode === 'PASSWORD_TOO_SHORT') {
          setError('Password must be at least 8 characters.')
        } else {
          // Generic error for security (don't reveal internal errors)
          setError('Unable to create account. Please try again.')
        }
        return
      }

      // Success - redirect to dashboard
      router.push('/dashboard')
    } catch (err) {
      // Log unexpected errors for debugging
      console.error('Signup exception:', err)
      setError('Unable to create account. Please check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-[#fafafa]">Create Account</h1>
        <p className="mt-2 text-[#a1a1aa]">
          Sign up to start managing your tasks
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-lg bg-[#ef4444]/10 border border-[#ef4444]/20 text-[#ef4444] text-sm">
            {error}
          </div>
        )}

        <div className="space-y-2">
          <label htmlFor="email" className="block text-sm font-medium text-[#fafafa]">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className="w-full px-4 py-2.5 rounded-lg bg-[#141416] border border-[#27272a] text-[#fafafa] placeholder-[#71717a] focus:outline-none focus:ring-2 focus:ring-[#3b82f6] focus:border-transparent transition-all"
            placeholder="you@example.com"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="password" className="block text-sm font-medium text-[#fafafa]">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="new-password"
            minLength={8}
            className="w-full px-4 py-2.5 rounded-lg bg-[#141416] border border-[#27272a] text-[#fafafa] placeholder-[#71717a] focus:outline-none focus:ring-2 focus:ring-[#3b82f6] focus:border-transparent transition-all"
            placeholder="At least 8 characters"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-[#fafafa]">
            Confirm Password
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            required
            autoComplete="new-password"
            minLength={8}
            className="w-full px-4 py-2.5 rounded-lg bg-[#141416] border border-[#27272a] text-[#fafafa] placeholder-[#71717a] focus:outline-none focus:ring-2 focus:ring-[#3b82f6] focus:border-transparent transition-all"
            placeholder="Confirm your password"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 px-4 rounded-lg bg-[#3b82f6] text-white font-medium hover:bg-[#2563eb] focus:outline-none focus:ring-2 focus:ring-[#3b82f6] focus:ring-offset-2 focus:ring-offset-[#0a0a0b] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {loading ? 'Creating account...' : 'Sign Up'}
        </button>
      </form>

      <p className="text-center text-sm text-[#a1a1aa]">
        Already have an account?{' '}
        <Link
          href="/signin"
          className="text-[#3b82f6] hover:text-[#2563eb] font-medium transition-colors"
        >
          Sign in
        </Link>
      </p>
    </div>
  )
}

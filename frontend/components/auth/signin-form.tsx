// Generated from @specs/features/authentication/spec.md
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { signIn } from '@/lib/auth-client'

export function SigninForm() {
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

    try {
      const result = await signIn.email({
        email,
        password,
      })

      if (result.error) {
        // Log full error for debugging (check browser console)
        console.error('Signin error:', result.error)

        // Generic error message - don't reveal if email exists or which field is wrong
        if (result.error.status === 429) {
          setError('Too many attempts. Please try again later.')
        } else {
          setError('Invalid email or password')
        }
        return
      }

      // Success - redirect to dashboard
      router.push('/dashboard')
    } catch (err) {
      // Log unexpected errors for debugging
      console.error('Signin exception:', err)
      setError('Unable to sign in. Please check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-[#fafafa]">Welcome Back</h1>
        <p className="mt-2 text-[#a1a1aa]">
          Sign in to access your tasks
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
            autoComplete="current-password"
            className="w-full px-4 py-2.5 rounded-lg bg-[#141416] border border-[#27272a] text-[#fafafa] placeholder-[#71717a] focus:outline-none focus:ring-2 focus:ring-[#3b82f6] focus:border-transparent transition-all"
            placeholder="Enter your password"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 px-4 rounded-lg bg-[#3b82f6] text-white font-medium hover:bg-[#2563eb] focus:outline-none focus:ring-2 focus:ring-[#3b82f6] focus:ring-offset-2 focus:ring-offset-[#0a0a0b] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>

      <p className="text-center text-sm text-[#a1a1aa]">
        Don&apos;t have an account?{' '}
        <Link
          href="/signup"
          className="text-[#3b82f6] hover:text-[#2563eb] font-medium transition-colors"
        >
          Create account
        </Link>
      </p>
    </div>
  )
}

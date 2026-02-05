// Generated from @specs/ui/pages.md
/**
 * Protected layout for authenticated routes (dashboard, settings).
 * Performs server-side session validation and redirects unauthenticated users.
 */
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { Header } from '@/components/layout/header'

// Force dynamic rendering because we use headers() for session check
export const dynamic = 'force-dynamic'

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  let session

  try {
    // Server-side session check using Better Auth
    session = await auth.api.getSession({
      headers: await headers(),
    })
  } catch (error) {
    console.error('[ProtectedLayout] Session check failed:', error)
    // On error, treat as no session
    session = null
  }

  // Redirect to login if no session or session is invalid
  if (!session || !session.user) {
    console.log('[ProtectedLayout] No valid session, redirecting to login')
    // Note: In Next.js App Router, we can't pass search params in redirect()
    // The redirect message will be handled by the login page if needed
    redirect('/login')
  }

  // Additional check: ensure session hasn't expired
  if (session.session.expiresAt && new Date(session.session.expiresAt) < new Date()) {
    console.log('[ProtectedLayout] Session expired, redirecting to login')
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-[#0a0a0b]">
      <Header
        user={{
          id: session.user.id,
          name: session.user.name,
          email: session.user.email,
          image: session.user.image,
        }}
      />
      <main>
        {children}
      </main>
    </div>
  )
}

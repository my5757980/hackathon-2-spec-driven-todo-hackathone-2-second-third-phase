// Generated from @specs/ui/pages.md
/**
 * Public layout for landing, about, login, signup pages.
 * Shows public header with Login/Signup buttons.
 */
import { PublicHeader } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col bg-[#0a0a0b]">
      <PublicHeader />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  )
}

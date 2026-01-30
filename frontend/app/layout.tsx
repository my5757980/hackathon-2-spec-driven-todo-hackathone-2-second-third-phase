// Generated from @specs/ui/pages.md
/**
 * Root layout for the entire application.
 * Sets up dark theme, fonts, and global providers.
 */
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ToastProvider } from '@/components/ui/toast'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Todo App',
  description: 'A beautiful, minimalist todo app that helps you focus on what matters most.',
  keywords: ['todo', 'task', 'productivity', 'organization'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} min-h-screen bg-[#0a0a0b] text-[#fafafa] antialiased`}>
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  )
}

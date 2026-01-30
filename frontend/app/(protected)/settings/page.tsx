// Generated from @specs/ui/pages.md
/**
 * Settings page - user preferences and account management.
 * Protected route, requires authentication.
 */
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import Link from 'next/link'
import { ArrowLeft, User, Shield, Bell, Palette, Tag, SortAsc, Trash2 } from 'lucide-react'
import { Avatar } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

interface SettingsItem {
  icon: typeof User
  label: string
  href: string
  active?: boolean
  danger?: boolean
}

interface SettingsSection {
  title: string
  items: SettingsItem[]
}

const settingsSections: SettingsSection[] = [
  {
    title: 'Profile',
    items: [
      { icon: User, label: 'Account', href: '/settings#account', active: true },
      { icon: Shield, label: 'Security', href: '/settings#security' },
      { icon: Bell, label: 'Notifications', href: '/settings#notifications' },
    ],
  },
  {
    title: 'Preferences',
    items: [
      { icon: Palette, label: 'Display', href: '/settings#display' },
      { icon: Tag, label: 'Categories', href: '/settings#categories' },
      { icon: SortAsc, label: 'Default Sort', href: '/settings#sort' },
    ],
  },
  {
    title: 'Danger Zone',
    items: [
      { icon: Trash2, label: 'Delete Account', href: '/settings#delete', danger: true },
    ],
  },
]

export default async function SettingsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    return null
  }

  const { user } = session

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard"
            className="text-[#71717a] hover:text-[#fafafa] transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-2xl font-bold text-[#fafafa]">Settings</h1>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar - Desktop */}
        <aside className="hidden lg:block w-64 flex-shrink-0">
          <nav className="space-y-6">
            {settingsSections.map((section) => (
              <div key={section.title}>
                <h3 className="text-xs font-semibold text-[#71717a] uppercase tracking-wider mb-2">
                  {section.title}
                </h3>
                <ul className="space-y-1">
                  {section.items.map((item) => {
                    const Icon = item.icon
                    return (
                      <li key={item.label}>
                        <Link
                          href={item.href}
                          className={`
                            flex items-center gap-3 px-3 py-2 rounded-lg text-sm
                            transition-colors duration-150
                            ${item.active
                              ? 'bg-[#3b82f6]/10 text-[#3b82f6]'
                              : item.danger
                              ? 'text-[#ef4444] hover:bg-[#ef4444]/10'
                              : 'text-[#a1a1aa] hover:bg-[#1c1c1f] hover:text-[#fafafa]'
                            }
                          `}
                        >
                          <Icon className="h-4 w-4" />
                          {item.label}
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              </div>
            ))}
          </nav>
        </aside>

        {/* Mobile navigation */}
        <nav className="lg:hidden space-y-4">
          {settingsSections.map((section) => (
            <Card key={section.title}>
              <CardHeader className="py-3">
                <CardTitle className="text-sm">{section.title}</CardTitle>
              </CardHeader>
              <CardContent className="py-0 pb-2">
                <ul className="divide-y divide-[#27272a]">
                  {section.items.map((item) => {
                    const Icon = item.icon
                    return (
                      <li key={item.label}>
                        <Link
                          href={item.href}
                          className={`
                            flex items-center gap-3 py-3 text-sm
                            ${item.danger ? 'text-[#ef4444]' : 'text-[#fafafa]'}
                          `}
                        >
                          <Icon className="h-4 w-4 text-[#71717a]" />
                          {item.label}
                          <ArrowLeft className="h-4 w-4 ml-auto rotate-180 text-[#71717a]" />
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              </CardContent>
            </Card>
          ))}
        </nav>

        {/* Main content - Desktop */}
        <main className="hidden lg:block flex-1">
          <div className="space-y-8">
            {/* Account Information */}
            <Card id="account">
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Profile section */}
                <div className="flex items-center gap-4">
                  <Avatar
                    src={user.image || undefined}
                    alt={user.name || user.email}
                    fallback={user.name?.charAt(0) || user.email.charAt(0)}
                    size="lg"
                  />
                  <div>
                    <p className="font-medium text-[#fafafa]">{user.name || 'User'}</p>
                    <p className="text-sm text-[#71717a]">{user.email}</p>
                  </div>
                </div>

                <Button variant="secondary" size="sm">
                  Edit Profile
                </Button>

                <hr className="border-[#27272a]" />

                {/* Email section */}
                <div className="space-y-3">
                  <label className="text-sm font-medium text-[#fafafa]">Email</label>
                  <Input
                    type="email"
                    defaultValue={user.email}
                    disabled
                  />
                  <Button variant="secondary" size="sm">
                    Update Email
                  </Button>
                </div>

                <hr className="border-[#27272a]" />

                {/* Password section */}
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-[#fafafa]">Change Password</h3>
                  <div className="space-y-3 max-w-md">
                    <div className="space-y-2">
                      <label className="text-xs text-[#71717a]">Current Password</label>
                      <Input type="password" placeholder="Enter current password" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs text-[#71717a]">New Password</label>
                      <Input type="password" placeholder="Enter new password" />
                    </div>
                    <Button variant="secondary" size="sm">
                      Update Password
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Danger Zone */}
            <Card id="delete" className="border-[#ef4444]/20">
              <CardHeader>
                <CardTitle className="text-[#ef4444]">Danger Zone</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-[#a1a1aa] mb-4">
                  Once you delete your account, there is no going back. Please be certain.
                </p>
                <Button variant="destructive" size="sm">
                  Delete Account
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}

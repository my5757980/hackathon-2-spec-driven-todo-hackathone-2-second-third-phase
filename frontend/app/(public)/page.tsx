// Generated from @specs/ui/pages.md
/**
 * Landing page - marketing page to convert visitors to users.
 * Public route, no authentication required.
 */
import Link from 'next/link'
import { Clock, Filter, Tag, Shield, Infinity } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DemoTaskPreview } from '@/components/features/landing/demo-task-preview'

const features = [
  {
    icon: Infinity,
    title: 'Unlimited Tasks',
    description: 'Create as many tasks as you need. No limits, no restrictions.',
  },
  {
    icon: Tag,
    title: 'Priority Levels',
    description: 'Organize tasks by priority to focus on what matters most.',
  },
  {
    icon: Clock,
    title: 'Due Dates & Reminders',
    description: 'Never miss a deadline with due dates and smart reminders.',
  },
  {
    icon: Filter,
    title: 'Search & Filter',
    description: 'Quickly find any task with powerful search and filtering.',
  },
  {
    icon: Tag,
    title: 'Categories & Tags',
    description: 'Group related tasks with custom categories and tags.',
  },
  {
    icon: Shield,
    title: 'Secure Authentication',
    description: 'Your data is protected with modern security practices.',
  },
]

export default function LandingPage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="min-h-[80vh] flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-16 w-full">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left: Copy */}
            <div className="space-y-8">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[#fafafa] leading-tight">
                Organize your life,{' '}
                <span className="text-[#3b82f6]">one task at a time.</span>
              </h1>
              <p className="text-lg sm:text-xl text-[#a1a1aa] max-w-lg">
                A beautiful, minimalist todo app that helps you focus on what matters most.
                Stay organized and boost your productivity.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/signup">
                  <Button size="lg" className="w-full sm:w-auto">
                    Get Started Free
                  </Button>
                </Link>
                <a href="#features">
                  <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                    Learn More
                  </Button>
                </a>
              </div>
            </div>

            {/* Right: App Preview */}
            <div className="relative">
              <DemoTaskPreview />
              {/* Decorative gradient */}
              <div className="absolute -inset-4 -z-10 bg-gradient-to-br from-[#3b82f6]/20 to-transparent rounded-3xl blur-3xl" />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-[#0a0a0b]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-[#fafafa] mb-4">
              Why Todo?
            </h2>
            <p className="text-lg text-[#a1a1aa] max-w-2xl mx-auto">
              Everything you need to stay organized and productive, nothing you don't.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {features.map((feature) => {
              const Icon = feature.icon
              return (
                <div
                  key={feature.title}
                  className="p-6 bg-[#141416] border border-[#27272a] rounded-xl hover:border-[#3b82f6]/50 transition-colors"
                >
                  <div className="w-12 h-12 rounded-lg bg-[#3b82f6]/10 flex items-center justify-center mb-4">
                    <Icon className="h-6 w-6 text-[#3b82f6]" />
                  </div>
                  <h3 className="text-lg font-semibold text-[#fafafa] mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-[#a1a1aa]">
                    {feature.description}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-[#141416] border-t border-[#27272a]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-12 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-[#fafafa] mb-4">
            Ready to get organized?
          </h2>
          <p className="text-lg text-[#a1a1aa] mb-8">
            Join thousands of users who are already boosting their productivity.
          </p>
          <Link href="/signup">
            <Button size="lg">
              Create Free Account
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}

// Generated from @specs/ui/pages.md
/**
 * About page - project information and architecture showcase for judges.
 * Public route, no authentication required.
 */
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

const phases = [
  { number: 1, name: 'CLI', description: 'Python Console App', status: 'complete' },
  { number: 2, name: 'Web App', description: 'Next.js + FastAPI', status: 'current' },
  { number: 3, name: 'Chatbot', description: 'AI + MCP Integration', status: 'upcoming' },
  { number: 4, name: 'K8s', description: 'Minikube + Helm', status: 'upcoming' },
  { number: 5, name: 'Cloud', description: 'DOKS + Dapr + Kafka', status: 'upcoming' },
]

const techStack = [
  {
    category: 'Frontend',
    technologies: ['Next.js 16', 'TypeScript', 'Tailwind CSS', 'Shadcn UI'],
  },
  {
    category: 'Backend',
    technologies: ['FastAPI', 'SQLModel', 'Better Auth', 'JWT'],
  },
  {
    category: 'Database',
    technologies: ['PostgreSQL', 'Neon (Serverless)'],
  },
]

export default function AboutPage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="py-16 sm:py-24 text-center border-b border-[#27272a]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h1 className="text-4xl sm:text-5xl font-bold text-[#fafafa] mb-4">
            About Todo App
          </h1>
          <p className="text-xl text-[#3b82f6] font-medium mb-4">
            Hackathon II - Evolution of Todo
          </p>
          <p className="text-lg text-[#a1a1aa]">
            Spec-Driven Development
          </p>
        </div>
      </section>

      {/* Project Overview */}
      <section className="py-16 border-b border-[#27272a]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl font-bold text-[#fafafa] mb-6">
            What is this project?
          </h2>
          <div className="prose prose-invert max-w-none">
            <p className="text-[#a1a1aa] leading-relaxed">
              A Todo application that evolves through 5 phases—from a simple Python CLI to a
              cloud-native deployment with Dapr and Kafka—demonstrating strict Spec-Driven
              Development where all code is generated from refined specifications.
            </p>
            <p className="text-[#a1a1aa] leading-relaxed mt-4">
              This project showcases how modern AI-assisted development can be guided by
              detailed specifications to produce consistent, high-quality code across multiple
              technology stacks and deployment targets.
            </p>
          </div>
        </div>
      </section>

      {/* Phases Timeline */}
      <section className="py-16 border-b border-[#27272a]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl font-bold text-[#fafafa] mb-8">
            Project Phases
          </h2>

          {/* Timeline */}
          <div className="relative">
            {/* Line */}
            <div className="absolute top-6 left-0 right-0 h-0.5 bg-[#27272a] hidden sm:block" />

            {/* Phase dots */}
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-6">
              {phases.map((phase) => (
                <div key={phase.number} className="relative flex flex-col items-center text-center">
                  <div
                    className={`
                      relative z-10 w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold
                      ${phase.status === 'complete' ? 'bg-[#22c55e] text-white' : ''}
                      ${phase.status === 'current' ? 'bg-[#3b82f6] text-white ring-4 ring-[#3b82f6]/30' : ''}
                      ${phase.status === 'upcoming' ? 'bg-[#27272a] text-[#71717a]' : ''}
                    `}
                  >
                    {phase.number}
                  </div>
                  <h3 className="mt-4 text-sm font-semibold text-[#fafafa]">
                    Phase {phase.number}: {phase.name}
                  </h3>
                  <p className="mt-1 text-xs text-[#71717a]">
                    {phase.description}
                  </p>
                  {phase.status === 'current' && (
                    <span className="mt-2 text-xs text-[#3b82f6] font-medium">
                      Current
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="py-16 border-b border-[#27272a]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl font-bold text-[#fafafa] mb-8">
            Tech Stack
          </h2>

          <div className="grid sm:grid-cols-3 gap-6">
            {techStack.map((stack) => (
              <Card key={stack.category}>
                <CardHeader>
                  <CardTitle className="text-lg">{stack.category}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {stack.technologies.map((tech) => (
                      <li key={tech} className="text-sm text-[#a1a1aa]">
                        {tech}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Architecture Diagram */}
      <section className="py-16 border-b border-[#27272a]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl font-bold text-[#fafafa] mb-8">
            Architecture
          </h2>

          <div className="bg-[#141416] border border-[#27272a] rounded-xl p-6 overflow-x-auto">
            <pre className="text-sm text-[#a1a1aa] font-mono whitespace-pre">
{`    Browser
       │
       ▼
┌──────────────────────────────────────────┐
│        Next.js Frontend                   │
│   (App Router + TypeScript + Tailwind)    │
└────────────────────┬─────────────────────┘
                     │ REST + JWT
                     ▼
┌──────────────────────────────────────────┐
│         FastAPI Backend                   │
│    ┌──────────────────────┐              │
│    │    Task Service      │              │
│    └──────────────────────┘              │
└────────────────────┬─────────────────────┘
                     │ SQLModel
                     ▼
┌──────────────────────────────────────────┐
│     Neon PostgreSQL (Serverless)          │
└──────────────────────────────────────────┘`}
            </pre>
          </div>
        </div>
      </section>

      {/* Credits */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-2xl font-bold text-[#fafafa] mb-4">
            Credits
          </h2>
          <p className="text-[#a1a1aa] mb-2">
            Built with Claude Code
          </p>
          <p className="text-[#a1a1aa] mb-2">
            Anthropic Hackathon II
          </p>
          <p className="text-[#71717a] mb-8">
            January 2026
          </p>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="secondary">
              View on GitHub
            </Button>
          </a>
        </div>
      </section>
    </div>
  )
}

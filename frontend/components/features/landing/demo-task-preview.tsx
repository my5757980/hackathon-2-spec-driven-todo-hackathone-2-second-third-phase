// Demo task preview for landing page
// Client component to handle interactive demo without passing functions from server
'use client'

import { useState } from 'react'
import { TaskCard, type Task } from '@/components/features/task/task-card'

const initialDemoTasks: Task[] = [
  {
    id: '1',
    title: 'Complete project proposal',
    completed: false,
    priority: 'P1',
    category: 'Work',
    due_date: new Date().toISOString(),
  },
  {
    id: '2',
    title: 'Review pull requests',
    completed: true,
    priority: 'P2',
    category: 'Work',
    completed_at: new Date().toISOString(),
  },
]

export function DemoTaskPreview() {
  const [tasks, setTasks] = useState(initialDemoTasks)

  const handleToggleComplete = (id: string | number, completed: boolean) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id
          ? {
              ...task,
              completed,
              completed_at: completed ? new Date().toISOString() : null,
            }
          : task
      )
    )
  }

  return (
    <div className="bg-[#141416] border border-[#27272a] rounded-2xl p-4 sm:p-6 space-y-3 shadow-2xl">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-3 h-3 rounded-full bg-[#ef4444]" />
        <div className="w-3 h-3 rounded-full bg-[#f59e0b]" />
        <div className="w-3 h-3 rounded-full bg-[#22c55e]" />
        <span className="ml-2 text-xs text-[#71717a]">Todo App</span>
      </div>
      {tasks.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          onToggleComplete={handleToggleComplete}
        />
      ))}
    </div>
  )
}

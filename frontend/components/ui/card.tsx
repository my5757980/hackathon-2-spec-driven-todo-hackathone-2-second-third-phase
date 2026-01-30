// Generated from @specs/ui/components.md
import { cn } from '@/lib/utils'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hover?: boolean
}

function Card({ className, hover, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-xl border border-[#27272a] bg-[#141416] p-4 md:p-5',
        'shadow-sm transition-all duration-200',
        hover && 'hover:border-[#3b82f6] hover:shadow-md cursor-pointer',
        className
      )}
      {...props}
    />
  )
}

function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('flex flex-col space-y-1.5 pb-4', className)}
      {...props}
    />
  )
}

function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn('text-xl font-semibold leading-normal text-[#fafafa]', className)}
      {...props}
    />
  )
}

function CardDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn('text-sm text-[#a1a1aa]', className)}
      {...props}
    />
  )
}

function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('', className)} {...props} />
  )
}

function CardFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('flex items-center pt-4', className)}
      {...props}
    />
  )
}

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter }

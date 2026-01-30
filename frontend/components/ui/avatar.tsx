// Generated from @specs/ui/components.md
import { cn } from '@/lib/utils'

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string
  alt?: string
  fallback?: string
  size?: 'sm' | 'md' | 'lg'
}

function Avatar({ className, src, alt, fallback, size = 'md', ...props }: AvatarProps) {
  const sizeClasses = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-12 w-12 text-base',
  }

  const initials = fallback || alt?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?'

  return (
    <div
      className={cn(
        'relative inline-flex items-center justify-center rounded-full',
        'bg-[#3b82f6] text-white font-medium',
        'overflow-hidden',
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {src ? (
        <img
          src={src}
          alt={alt || 'Avatar'}
          className="h-full w-full object-cover"
        />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  )
}

export { Avatar }

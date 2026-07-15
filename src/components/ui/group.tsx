import type { HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

/** iOS-style inset grouped sheet */
export function Group({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('glass overflow-hidden rounded-2xl', className)} {...props} />
}

export function GroupHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('border-b border-border/80 px-4 py-3 sm:px-5', className)}
      {...props}
    />
  )
}

export function GroupTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn('text-[15px] font-semibold tracking-tight', className)} {...props} />
}

export function GroupDescription({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn('mt-0.5 text-[13px] text-muted-foreground', className)} {...props} />
}

export function GroupBody({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('px-4 py-3 sm:px-5', className)} {...props} />
}

export function GroupRow({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'group-row flex items-center justify-between gap-3 px-4 py-3.5 sm:px-5',
        className,
      )}
      {...props}
    />
  )
}

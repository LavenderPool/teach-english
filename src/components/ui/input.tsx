import * as React from 'react'
import { cn } from '@/lib/utils'

export const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<'input'>>(
  ({ className, type, ...props }, ref) => (
    <input
      type={type}
      className={cn(
        'flex h-10 w-full rounded-2xl border border-border/80 bg-white/40 px-3.5 py-2 text-sm shadow-[inset_0_1px_0_rgba(255,255,255,0.55)] backdrop-blur-xl transition-all placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/35 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white/8 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]',
        className,
      )}
      ref={ref}
      {...props}
    />
  ),
)
Input.displayName = 'Input'

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<'textarea'>>(
  ({ className, ...props }, ref) => (
    <textarea
      className={cn(
        'flex min-h-[96px] w-full rounded-2xl border border-border/80 bg-white/40 px-3.5 py-2.5 text-sm shadow-[inset_0_1px_0_rgba(255,255,255,0.55)] backdrop-blur-xl transition-all placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/35 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white/8 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]',
        className,
      )}
      ref={ref}
      {...props}
    />
  ),
)
Textarea.displayName = 'Textarea'

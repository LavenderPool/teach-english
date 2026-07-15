import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-2xl text-sm font-medium transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/35 disabled:pointer-events-none disabled:opacity-50 cursor-pointer active:scale-[0.98]',
  {
    variants: {
      variant: {
        default:
          'bg-accent text-accent-foreground shadow-[0_8px_20px_-10px_rgba(0,122,255,0.65)] hover:brightness-110',
        secondary:
          'glass-soft text-foreground hover:bg-white/55 dark:hover:bg-white/12',
        outline:
          'border border-border/80 bg-white/35 backdrop-blur-xl hover:bg-white/55 dark:bg-white/5 dark:hover:bg-white/10',
        ghost: 'hover:bg-white/40 dark:hover:bg-white/10',
        danger: 'bg-danger text-white shadow-[0_8px_20px_-10px_rgba(255,69,58,0.55)] hover:brightness-110',
        success:
          'bg-success text-white shadow-[0_8px_20px_-10px_rgba(48,209,88,0.55)] hover:brightness-110',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-8 rounded-xl px-3 text-xs',
        lg: 'h-11 rounded-2xl px-6',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    )
  },
)
Button.displayName = 'Button'

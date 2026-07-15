import * as TabsPrimitive from '@radix-ui/react-tabs'
import { cn } from '@/lib/utils'

export const Tabs = TabsPrimitive.Root

export function TabsList({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      className={cn(
        'glass-soft inline-flex h-11 items-center justify-center rounded-full p-1 text-muted-foreground',
        className,
      )}
      {...props}
    />
  )
}

export function TabsTrigger({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      className={cn(
        'inline-flex items-center justify-center whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 data-[state=active]:bg-white/80 data-[state=active]:text-foreground data-[state=active]:shadow-[0_4px_14px_-8px_rgba(15,23,42,0.35)] dark:data-[state=active]:bg-white/14 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/35',
        className,
      )}
      {...props}
    />
  )
}

export function TabsContent({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      className={cn('mt-5 animate-fade-in focus-visible:outline-none', className)}
      {...props}
    />
  )
}

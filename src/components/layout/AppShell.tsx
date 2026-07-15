import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Toaster } from '@/components/ui/toast'

export function AppShell() {
  return (
    <div className="flex h-screen overflow-hidden bg-transparent text-foreground">
      <Sidebar />
      <main className="relative flex min-w-0 flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-5xl px-5 pb-28 pt-8 md:px-10">
          <Outlet />
        </div>
      </main>
      <Toaster />
    </div>
  )
}

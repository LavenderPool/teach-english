import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Toaster } from '@/components/ui/toast'

export function AppShell() {
  return (
    <div className="flex h-screen overflow-hidden bg-transparent text-foreground">
      <Sidebar />
      <main className="relative flex min-w-0 flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-[920px] px-5 pb-24 pt-9 md:px-8">
          <Outlet />
        </div>
      </main>
      <Toaster />
    </div>
  )
}

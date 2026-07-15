import { NavLink } from 'react-router-dom'
import {
  AudioLines,
  Clock3,
  Layers3,
  PenLine,
  Settings,
  LayoutDashboard,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV = [
  { to: '/', label: 'Обзор', icon: LayoutDashboard, end: true },
  { to: '/transcription', label: 'Транскрипция', icon: AudioLines },
  { to: '/tenses', label: 'Времена', icon: Clock3 },
  { to: '/words', label: 'Слова', icon: Layers3 },
  { to: '/generation', label: 'Генерация', icon: PenLine },
]

export function Sidebar() {
  return (
    <aside className="m-3 mr-0 flex h-[calc(100%-1.5rem)] w-[220px] shrink-0 flex-col rounded-2xl glass-nav px-2.5 py-4">
      <div className="mb-6 px-2.5 pt-1">
        <div className="font-display text-[1.35rem] font-semibold leading-none tracking-tight">
          English
        </div>
        <div className="mt-1 text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
          Learner
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-0.5">
        {NAV.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn(
                'group relative flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-[13px] font-medium text-muted-foreground transition-colors duration-150 hover:bg-muted hover:text-foreground',
                isActive && 'bg-muted text-foreground',
              )
            }
          >
            {({ isActive }) => (
              <>
                <span
                  className={cn(
                    'absolute left-0 top-1/2 h-4 w-[3px] -translate-y-1/2 rounded-r-full bg-accent opacity-0 transition-opacity',
                    isActive && 'opacity-100',
                  )}
                />
                <Icon
                  className={cn('h-[17px] w-[17px] shrink-0', isActive && 'text-accent')}
                  strokeWidth={1.75}
                />
                {label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <NavLink
        to="/settings"
        className={({ isActive }) =>
          cn(
            'relative mt-1 flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-[13px] font-medium text-muted-foreground transition-colors duration-150 hover:bg-muted hover:text-foreground',
            isActive && 'bg-muted text-foreground',
          )
        }
      >
        {({ isActive }) => (
          <>
            <span
              className={cn(
                'absolute left-0 top-1/2 h-4 w-[3px] -translate-y-1/2 rounded-r-full bg-accent opacity-0 transition-opacity',
                isActive && 'opacity-100',
              )}
            />
            <Settings
              className={cn('h-[17px] w-[17px]', isActive && 'text-accent')}
              strokeWidth={1.75}
            />
            Настройки
          </>
        )}
      </NavLink>
    </aside>
  )
}

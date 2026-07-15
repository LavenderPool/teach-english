import { NavLink } from 'react-router-dom'
import {
  AudioLines,
  BookOpen,
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
    <aside className="flex h-full w-[232px] shrink-0 flex-col border-r border-border/60 bg-sidebar px-3 py-5">
      <div className="mb-8 flex items-center gap-2.5 px-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent text-sm font-bold text-accent-foreground">
          EL
        </div>
        <div>
          <div className="text-sm font-semibold tracking-tight">English Learner</div>
          <div className="text-[11px] text-muted-foreground">macOS · DeepSeek</div>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1">
        {NAV.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors duration-200 hover:bg-muted/70 hover:text-foreground',
                isActive && 'bg-sidebar-active text-accent',
              )
            }
          >
            <Icon className="h-4 w-4 shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>

      <NavLink
        to="/settings"
        className={({ isActive }) =>
          cn(
            'mt-2 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors duration-200 hover:bg-muted/70 hover:text-foreground',
            isActive && 'bg-sidebar-active text-accent',
          )
        }
      >
        <Settings className="h-4 w-4" />
        Настройки
      </NavLink>

      <div className="mt-4 flex items-center gap-2 px-2 text-[11px] text-muted-foreground">
        <BookOpen className="h-3.5 w-3.5" />
        Учитесь каждый день
      </div>
    </aside>
  )
}

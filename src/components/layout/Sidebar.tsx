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
    <aside className="m-3 mr-0 flex h-[calc(100%-1.5rem)] w-[232px] shrink-0 flex-col rounded-[1.75rem] glass-nav px-3 py-5">
      <div className="mb-8 flex items-center gap-2.5 px-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-accent text-sm font-bold text-accent-foreground shadow-[0_10px_24px_-12px_rgba(0,122,255,0.8)]">
          EL
        </div>
        <div>
          <div className="text-sm font-semibold tracking-tight">English Learner</div>
          <div className="text-[11px] text-muted-foreground">Liquid Glass · DeepSeek</div>
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
                'flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-all duration-200 hover:bg-white/35 hover:text-foreground dark:hover:bg-white/8',
                isActive && 'nav-active-pill bg-sidebar-active text-accent shadow-[inset_0_1px_0_rgba(255,255,255,0.45)]',
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
            'mt-2 flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-all duration-200 hover:bg-white/35 hover:text-foreground dark:hover:bg-white/8',
            isActive && 'nav-active-pill bg-sidebar-active text-accent shadow-[inset_0_1px_0_rgba(255,255,255,0.45)]',
          )
        }
      >
        <Settings className="h-4 w-4" />
        Настройки
      </NavLink>
    </aside>
  )
}

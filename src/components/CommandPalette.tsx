import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search } from 'lucide-react'
import { TENSES } from '@/data/tenses'
import { useAppStore } from '@/stores/app-store'
import { cn } from '@/lib/utils'

const STATIC = [
  { label: 'Обзор', to: '/' },
  { label: 'Транскрипция', to: '/transcription' },
  { label: 'Времена', to: '/tenses' },
  { label: 'Слова', to: '/words' },
  { label: 'Аркада', to: '/words/arcade' },
  { label: 'Генерация', to: '/generation' },
  { label: 'Настройки', to: '/settings' },
]

export function CommandPalette() {
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState('')
  const navigate = useNavigate()
  const cards = useAppStore((s) => s.cards)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setOpen((v) => !v)
      }
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const items = useMemo(() => {
    const tenseItems = TENSES.map((t) => ({
      label: `${t.nameEn} · ${t.nameRu}`,
      to: `/tenses/${t.id}`,
    }))
    const wordItems = cards.slice(0, 50).map((c) => ({
      label: `${c.word} — ${c.translation}`,
      to: '/words',
    }))
    const all = [...STATIC, ...tenseItems, ...wordItems]
    const query = q.trim().toLowerCase()
    if (!query) return all.slice(0, 12)
    return all.filter((i) => i.label.toLowerCase().includes(query)).slice(0, 12)
  }, [q, cards])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 px-4 pt-[15vh]"
      onClick={() => setOpen(false)}
    >
      <div
        className="w-full max-w-lg overflow-hidden rounded-2xl border border-border bg-card shadow-2xl animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 border-b border-border px-4">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Поиск раздела, времени или слова…"
            className="h-12 w-full bg-transparent text-sm outline-none"
          />
          <kbd className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">esc</kbd>
        </div>
        <div className="max-h-72 overflow-y-auto p-2">
          {items.map((item) => (
            <button
              key={item.to + item.label}
              type="button"
              className={cn(
                'flex w-full rounded-xl px-3 py-2.5 text-left text-sm transition-colors hover:bg-muted',
              )}
              onClick={() => {
                navigate(item.to)
                setOpen(false)
                setQ('')
              }}
            >
              {item.label}
            </button>
          ))}
          {items.length === 0 && (
            <div className="px-3 py-6 text-center text-sm text-muted-foreground">Ничего не найдено</div>
          )}
        </div>
      </div>
    </div>
  )
}

import { useEffect, useMemo, useState } from 'react'
import { ExternalLink, Volume2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Toaster } from '@/components/ui/toast'
import type { Card as VocabCard, ReviewQuality } from '@/lib/types'
import { openMainWindow } from '@/lib/mini-window'
import { isTauri } from '@/lib/tauri'
import { speak } from '@/lib/tts'
import { useAppStore } from '@/stores/app-store'

function pickQueue(cards: VocabCard[], focusId: string | null): VocabCard[] {
  const due = [...cards]
    .filter((c) => c.nextReviewAt <= Date.now() || !c.mastered)
    .sort((a, b) => a.nextReviewAt - b.nextReviewAt)
  const pool = due.length > 0 ? due : cards
  if (pool.length === 0) return []
  if (focusId) {
    const focused = pool.find((c) => c.id === focusId)
    const rest = pool.filter((c) => c.id !== focusId)
    return focused ? [focused, ...rest.slice(0, 11)] : pool.slice(0, 12)
  }
  return pool.slice(0, 12)
}

export function MiniStudyPage() {
  const cards = useAppStore((s) => s.cards)
  const reviewCard = useAppStore((s) => s.reviewCard)
  const hydrate = useAppStore((s) => s.hydrate)
  const hydrated = useAppStore((s) => s.hydrated)
  const settings = useAppStore((s) => s.settings)
  const voice = settings.ttsVoice
  const rate = settings.ttsRate

  const params = useMemo(() => new URLSearchParams(window.location.search), [])
  const [focusId, setFocusId] = useState<string | null>(params.get('card'))
  const [queue, setQueue] = useState<VocabCard[]>([])
  const [revealed, setRevealed] = useState(false)

  useEffect(() => {
    if (!hydrated) hydrate()
  }, [hydrate, hydrated])

  useEffect(() => {
    setQueue(pickQueue(cards, focusId))
    setRevealed(false)
  }, [cards, focusId, hydrated])

  useEffect(() => {
    if (!isTauri()) return
    let disposed = false
    let unlisten: (() => void) | undefined
    void import('@tauri-apps/api/event').then(({ listen }) => {
      if (disposed) return
      void listen<{ cardId: string | null }>('mini-focus-card', (event) => {
        setFocusId(event.payload.cardId)
      }).then((fn) => {
        if (disposed) {
          fn()
          return
        }
        unlisten = fn
      })
    })
    return () => {
      disposed = true
      unlisten?.()
    }
  }, [])

  const current = queue[0]

  const rateQuality = (q: ReviewQuality) => {
    if (!current) return
    reviewCard(current.id, q)
    setRevealed(false)
    setQueue((prev) => prev.slice(1))
    setFocusId(null)
  }

  const unlockHint =
    settings.wordAlarmEnabled && settings.wordAlarmPendingUnlock
      ? `${settings.wordAlarmCardsProgress}/${settings.wordAlarmCardsRequired} карточек до следующего будильника`
      : null

  return (
    <div className="flex h-screen flex-col bg-transparent text-foreground">
      <header className="m-3 mb-0 flex items-center justify-between rounded-3xl glass-nav px-4 py-3">
        <div>
          <div className="text-sm font-semibold tracking-tight">English Learner</div>
          <div className="text-[11px] text-muted-foreground">Мини-режим · слова</div>
        </div>
        <Button size="sm" variant="secondary" onClick={() => void openMainWindow('/words')}>
          <ExternalLink className="h-3.5 w-3.5" />
          Основная версия
        </Button>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center gap-4 px-5 py-6">
        {unlockHint && (
          <p className="text-center text-xs text-muted-foreground">{unlockHint}</p>
        )}

        {!current ? (
          <div className="space-y-3 text-center">
            <p className="text-sm text-muted-foreground">
              {cards.length === 0
                ? 'Нет слов. Откройте основное приложение и добавьте словарь.'
                : 'Карточки на сейчас закончились.'}
            </p>
            <Button variant="secondary" onClick={() => void openMainWindow('/words')}>
              Перейти в приложение
            </Button>
          </div>
        ) : (
          <>
            <div className="text-xs text-muted-foreground">Осталось: {queue.length}</div>
            <div className="glass-strong w-full max-w-sm space-y-4 rounded-[1.75rem] px-5 py-10 text-center">
              {current.category && <Badge>{current.category}</Badge>}
              <div className="text-3xl font-semibold tracking-tight">{current.word}</div>
              {current.transcription && (
                <div className="font-mono text-sm text-muted-foreground">{current.transcription}</div>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => speak(current.word, { voiceURI: voice, rate })}
              >
                <Volume2 className="h-4 w-4" /> Прослушать
              </Button>
              {revealed ? (
                <div className="space-y-2">
                  <div className="text-xl">{current.translation}</div>
                  {current.exampleEn && (
                    <p className="text-sm text-muted-foreground">{current.exampleEn}</p>
                  )}
                </div>
              ) : (
                <Button onClick={() => setRevealed(true)}>Показать перевод</Button>
              )}
            </div>
            {revealed && (
              <div className="grid w-full max-w-sm grid-cols-2 gap-2">
                {(
                  [
                    ['again', 'Забыл', 'danger'],
                    ['hard', 'Трудно', 'outline'],
                    ['good', 'Хорошо', 'secondary'],
                    ['easy', 'Легко', 'default'],
                  ] as const
                ).map(([q, label, variant]) => (
                  <Button key={q} variant={variant} onClick={() => rateQuality(q)}>
                    {label}
                  </Button>
                ))}
              </div>
            )}
          </>
        )}
      </main>
      <Toaster />
    </div>
  )
}

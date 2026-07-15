import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Volume2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { Card as VocabCard, ReviewQuality } from '@/lib/types'
import { speak } from '@/lib/tts'
import { useAppStore } from '@/stores/app-store'

export function StudySession() {
  const dueToday = useAppStore((s) => s.dueToday)
  const reviewCard = useAppStore((s) => s.reviewCard)
  const voice = useAppStore((s) => s.settings.ttsVoice)
  const rate = useAppStore((s) => s.settings.ttsRate)

  const [queue, setQueue] = useState<VocabCard[]>(() => dueToday())
  const [revealed, setRevealed] = useState(false)
  const [started, setStarted] = useState(false)

  const current = queue[0]

  const start = () => {
    setQueue(dueToday())
    setRevealed(false)
    setStarted(true)
  }

  const rateQuality = (q: ReviewQuality) => {
    if (!current) return
    reviewCard(current.id, q)
    setRevealed(false)
    setQueue((prev) => prev.slice(1))
  }

  if (!started) {
    const due = dueToday()
    return (
      <Card>
        <CardHeader>
          <CardTitle>
            {due.length === 0 ? 'Нет карточек на сегодня' : `${due.length} карточек к повторению`}
          </CardTitle>
          <CardDescription>
            {due.length === 0
              ? 'Добавьте слова или загляните в аркаду.'
              : 'Оценивайте вспоминание по шкале SM-2.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {due.length > 0 ? (
            <Button onClick={start}>Начать сессию</Button>
          ) : (
            <Button asChild variant="secondary">
              <Link to="/words/arcade">Открыть аркаду</Link>
            </Button>
          )}
        </CardContent>
      </Card>
    )
  }

  if (!current) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Сессия завершена</CardTitle>
          <CardDescription>Отличная работа — на сегодня всё повторено.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="secondary" onClick={start}>
            Проверить ещё раз
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="mx-auto max-w-lg space-y-4">
      <div className="text-center text-sm text-muted-foreground">Осталось: {queue.length}</div>
      <Card className="min-h-[280px]">
        <CardContent className="flex flex-col items-center justify-center gap-4 px-6 py-12 text-center">
          <Badge>{current.category || 'General'}</Badge>
          <div className="text-3xl font-semibold tracking-tight">{current.word}</div>
          {current.transcription && (
            <div className="font-mono text-muted-foreground">{current.transcription}</div>
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
        </CardContent>
      </Card>
      {revealed && (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
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
    </div>
  )
}

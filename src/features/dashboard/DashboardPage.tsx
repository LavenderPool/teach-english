import { Link } from 'react-router-dom'
import { AudioLines, Clock3, Flame, Layers3, PenLine } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { TENSES } from '@/data/tenses'
import { useAppStore } from '@/stores/app-store'
import { formatPercent } from '@/lib/utils'

function scoreColor(score: number) {
  if (score >= 75) return 'bg-success'
  if (score >= 40) return 'bg-warning'
  return 'bg-danger'
}

export function DashboardPage() {
  const cards = useAppStore((s) => s.cards)
  const dueToday = useAppStore((s) => s.dueToday)
  const progress = useAppStore((s) => s.tensesProgress)
  const streak = useAppStore((s) => s.settings.streakDays)
  const translations = useAppStore((s) => s.translationExercises)
  const due = dueToday()
  const mastered = cards.filter((c) => c.mastered).length
  const avgTranslation =
    translations.length === 0
      ? null
      : translations.reduce((a, t) => a + t.matchPercentage, 0) / translations.length

  return (
    <div className="animate-fade-in space-y-8">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight">Обзор</h1>
        <p className="mt-1 text-muted-foreground">
          Сводка прогресса и быстрый старт занятий на сегодня.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat
          icon={<Layers3 className="h-4 w-4" />}
          label="К повторению"
          value={String(due.length)}
          hint={`${mastered} освоено из ${cards.length}`}
        />
        <Stat
          icon={<Flame className="h-4 w-4" />}
          label="Серия дней"
          value={String(streak)}
          hint="Занимайтесь каждый день"
        />
        <Stat
          icon={<Clock3 className="h-4 w-4" />}
          label="Времена"
          value={`${progress.filter((p) => p.attempts > 0).length}/12`}
          hint="Практиковано"
        />
        <Stat
          icon={<PenLine className="h-4 w-4" />}
          label="Перевод"
          value={avgTranslation == null ? '—' : formatPercent(avgTranslation)}
          hint={`${translations.length} упражнений`}
        />
      </div>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Времена</h2>
          <Button asChild variant="ghost" size="sm">
            <Link to="/tenses">Открыть</Link>
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
          {TENSES.map((t) => {
            const p = progress.find((x) => x.tenseId === t.id)
            const score = p?.practiceScore ?? 0
            return (
              <Link
                key={t.id}
                to={`/tenses/${t.id}`}
                className="rounded-2xl border border-border/70 bg-card p-3 transition-colors hover:bg-muted/40"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-medium leading-snug">{t.nameEn}</span>
                  <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${scoreColor(score)}`} />
                </div>
                <Progress value={score} className="mt-3 h-1.5" />
              </Link>
            )
          })}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Layers3 className="h-4 w-4 text-accent" /> Карточки на сегодня
            </CardTitle>
            <CardDescription>
              {due.length === 0
                ? 'На сегодня всё повторено — можно добавить новые слова.'
                : `${due.length} карточек ждут повторения.`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link to="/words">{due.length ? 'Учить сейчас' : 'К словам'}</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <AudioLines className="h-4 w-4 text-accent" /> Быстрый старт
            </CardTitle>
            <CardDescription>Выберите раздел для занятия.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Button asChild variant="secondary" size="sm">
              <Link to="/transcription">Транскрипция</Link>
            </Button>
            <Button asChild variant="secondary" size="sm">
              <Link to="/tenses">Времена</Link>
            </Button>
            <Button asChild variant="secondary" size="sm">
              <Link to="/words/arcade">Аркада</Link>
            </Button>
            <Button asChild variant="secondary" size="sm">
              <Link to="/generation">Перевод</Link>
            </Button>
          </CardContent>
        </Card>
      </section>

      {due.slice(0, 5).length > 0 && (
        <section>
          <h2 className="mb-3 text-lg font-semibold">Очередь повторения</h2>
          <div className="space-y-2">
            {due.slice(0, 5).map((c) => (
              <div
                key={c.id}
                className="flex items-center justify-between rounded-2xl border border-border/60 bg-card px-4 py-3"
              >
                <div>
                  <div className="font-medium">{c.word}</div>
                  <div className="text-xs text-muted-foreground">{c.transcription || '—'}</div>
                </div>
                <Badge>{c.category || 'General'}</Badge>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

function Stat({
  icon,
  label,
  value,
  hint,
}: {
  icon: React.ReactNode
  label: string
  value: string
  hint: string
}) {
  return (
    <div className="rounded-2xl border border-border/70 bg-card p-5 shadow-sm">
      <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
        {icon}
        {label}
      </div>
      <div className="mt-2 text-3xl font-semibold tracking-tight">{value}</div>
      <div className="mt-1 text-xs text-muted-foreground">{hint}</div>
    </div>
  )
}

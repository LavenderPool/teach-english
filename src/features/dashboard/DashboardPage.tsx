import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Group, GroupBody, GroupHeader, GroupRow, GroupTitle } from '@/components/ui/group'
import { Progress } from '@/components/ui/progress'
import { TENSES } from '@/data/tenses'
import { useAppStore } from '@/stores/app-store'
import { formatPercent } from '@/lib/utils'

function scoreTone(score: number) {
  if (score >= 75) return 'text-success'
  if (score >= 40) return 'text-warning'
  return 'text-danger'
}

export function DashboardPage() {
  const cards = useAppStore((s) => s.cards)
  const dueToday = useAppStore((s) => s.dueToday)
  const progress = useAppStore((s) => s.tensesProgress)
  const streak = useAppStore((s) => s.settings.streakDays)
  const translations = useAppStore((s) => s.translationExercises)
  const due = dueToday()
  const mastered = cards.filter((c) => c.mastered).length
  const practicedTenses = progress.filter((p) => p.attempts > 0).length
  const avgTranslation =
    translations.length === 0
      ? null
      : translations.reduce((a, t) => a + t.matchPercentage, 0) / translations.length

  return (
    <div className="animate-fade-in space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Сегодня
          </p>
          <h1 className="page-title mt-1 text-[2.35rem] leading-none">Обзор</h1>
        </div>
        <Button asChild size="lg">
          <Link to="/words">{due.length ? 'Учить слова' : 'Открыть слова'}</Link>
        </Button>
      </header>

      <Group>
        <div className="grid grid-cols-2 divide-x divide-border sm:grid-cols-4">
          <Metric label="К повторению" value={String(due.length)} hint={`${mastered}/${cards.length}`} />
          <Metric label="Серия" value={String(streak)} hint="дней" />
          <Metric label="Времена" value={`${practicedTenses}/12`} hint="практика" />
          <Metric
            label="Перевод"
            value={avgTranslation == null ? '—' : formatPercent(avgTranslation)}
            hint={`${translations.length} упр.`}
          />
        </div>
      </Group>

      <section>
        <div className="mb-2 flex items-baseline justify-between px-1">
          <h2 className="section-label !mb-0 !ml-0">Времена</h2>
          <Link to="/tenses" className="text-[13px] font-semibold text-accent hover:opacity-80">
            Все
          </Link>
        </div>
        <Group>
          {TENSES.map((t) => {
            const p = progress.find((x) => x.tenseId === t.id)
            const score = p?.practiceScore ?? 0
            return (
              <Link
                key={t.id}
                to={`/tenses/${t.id}`}
                className="group-row flex items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/70 sm:px-5"
              >
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[14px] font-medium">{t.nameEn}</div>
                  <div className="truncate text-[12px] text-muted-foreground">{t.nameRu}</div>
                </div>
                <div className="w-20 shrink-0">
                  <div className={`mb-1 text-right text-[11px] font-semibold ${scoreTone(score)}`}>
                    {formatPercent(score)}
                  </div>
                  <Progress value={score} className="h-1" />
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/70" />
              </Link>
            )
          })}
        </Group>
      </section>

      <section className="grid gap-5 md:grid-cols-2">
        <div>
          <h2 className="section-label">Занятие</h2>
          <Group>
            <GroupHeader>
              <GroupTitle>Карточки на сегодня</GroupTitle>
            </GroupHeader>
            <GroupBody className="space-y-3">
              <p className="text-[13px] text-muted-foreground">
                {due.length === 0
                  ? 'На сегодня всё повторено — можно добавить новые слова.'
                  : `${due.length} карточек ждут повторения.`}
              </p>
              <Button asChild variant={due.length ? 'default' : 'secondary'}>
                <Link to="/words">{due.length ? 'Учить сейчас' : 'К словам'}</Link>
              </Button>
            </GroupBody>
          </Group>
        </div>

        <div>
          <h2 className="section-label">Разделы</h2>
          <Group>
            {(
              [
                ['/transcription', 'Транскрипция', 'IPA и произношение'],
                ['/tenses', 'Времена', 'Теория и практика'],
                ['/words/arcade', 'Аркада', 'Быстрые слова'],
                ['/generation', 'Перевод', 'Проверка сходимости'],
              ] as const
            ).map(([to, title, subtitle]) => (
              <Link
                key={to}
                to={to}
                className="group-row flex items-center justify-between gap-3 px-4 py-3.5 transition-colors hover:bg-muted/70 sm:px-5"
              >
                <div>
                  <div className="text-[14px] font-medium">{title}</div>
                  <div className="text-[12px] text-muted-foreground">{subtitle}</div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground/70" />
              </Link>
            ))}
          </Group>
        </div>
      </section>

      {due.slice(0, 5).length > 0 && (
        <section>
          <h2 className="section-label">Очередь</h2>
          <Group>
            {due.slice(0, 5).map((c) => (
              <GroupRow key={c.id}>
                <div>
                  <div className="text-[14px] font-medium">{c.word}</div>
                  <div className="font-mono text-[12px] text-muted-foreground">
                    {c.transcription || '—'}
                  </div>
                </div>
                <Badge>{c.category || 'General'}</Badge>
              </GroupRow>
            ))}
          </Group>
        </section>
      )}
    </div>
  )
}

function Metric({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="px-4 py-4 sm:px-5">
      <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
        {label}
      </div>
      <div className="font-display mt-1 text-[1.85rem] leading-none tracking-tight">{value}</div>
      <div className="mt-1 text-[11px] text-muted-foreground">{hint}</div>
    </div>
  )
}

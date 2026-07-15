import { useMemo, useRef, useState } from 'react'
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Loader2 } from 'lucide-react'
import { AiBanner } from '@/components/AiBanner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/input'
import { Label } from '@/components/ui/badge'
import { toast } from '@/stores/toast-store'
import { TENSES } from '@/data/tenses'
import { DeepSeekError, deepseekJson } from '@/lib/deepseek'
import { PrefetchSlot } from '@/lib/prefetch'
import type { CefrLevel, TextLength, TranslationDirection } from '@/lib/types'
import { formatDate, formatPercent } from '@/lib/utils'
import { useAppStore } from '@/stores/app-store'

type TranslationPrompt = {
  source_text: string
  ideal_translation: string
}

export function GenerationPage() {
  const apiKey = useAppStore((s) => s.settings.deepseekApiKey)
  const addTranslationExercise = useAppStore((s) => s.addTranslationExercise)
  const history = useAppStore((s) => s.translationExercises)

  const [selected, setSelected] = useState<string[]>(['present_simple', 'past_simple'])
  const [direction, setDirection] = useState<TranslationDirection>('ru_to_en')
  const [length, setLength] = useState<TextLength>('sentence')
  const [level, setLevel] = useState<CefrLevel>('B1')
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(false)
  const [exercise, setExercise] = useState<TranslationPrompt | null>(null)
  const [userTranslation, setUserTranslation] = useState('')
  const [result, setResult] = useState<{
    match_percentage: number
    feedback: string
    grammar_errors: string[]
  } | null>(null)
  const prefetch = useRef(new PrefetchSlot<TranslationPrompt>()).current

  const toggleTense = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    )
    prefetch.clear()
  }

  const selectAll = () => {
    setSelected(TENSES.map((t) => t.id))
    prefetch.clear()
  }
  const clearAll = () => {
    setSelected([])
    prefetch.clear()
  }

  const fetchExercise = async () => {
    const tenseNames = selected
      .map((id) => TENSES.find((t) => t.id === id)?.nameEn)
      .filter(Boolean)
      .join(', ')
    return deepseekJson<TranslationPrompt>({
      apiKey,
      temperature: 0.8,
      messages: [
        {
          role: 'system',
          content: `Ты генератор упражнений на перевод. Верни JSON:
{"source_text":"...","ideal_translation":"..."}
direction=${direction}: если ru_to_en — source на русском, ideal на английском; если en_to_ru — наоборот.
Длина: ${length === 'sentence' ? 'одно предложение' : 'короткий абзац 3-5 предложений'}.
Уровень словаря: ${level}.
Используй времена: ${tenseNames}.`,
        },
        { role: 'user', content: 'Сгенерируй упражнение на перевод.' },
      ],
    })
  }

  const generate = async () => {
    if (!apiKey.trim()) {
      toast('Проверьте API-ключ DeepSeek в настройках', { kind: 'error' })
      return
    }
    if (selected.length === 0) {
      toast('Выберите хотя бы одно время', { kind: 'error' })
      return
    }
    setLoading(true)
    setResult(null)
    setUserTranslation('')
    try {
      const data = await prefetch.take(fetchExercise)
      setExercise(data)
    } catch (e) {
      toast(e instanceof DeepSeekError ? e.message : 'Ошибка генерации', { kind: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const check = async () => {
    if (!exercise || !userTranslation.trim()) return
    setChecking(true)
    try {
      const data = await deepseekJson<{
        match_percentage: number
        feedback: string
        grammar_errors: string[]
      }>({
        apiKey,
        temperature: 0.2,
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: `Оцени точность перевода пользователя по шкале 0-100%, учитывая:
- сохранение смысла (важнее всего)
- корректность использования грамматического времени
- естественность формулировки
Верни JSON: {"match_percentage": число, "feedback": "краткое пояснение", "grammar_errors": ["..."]}`,
          },
          {
            role: 'user',
            content: `Оригинал: ${exercise.source_text}
Эталонный перевод: ${exercise.ideal_translation}
Перевод пользователя: ${userTranslation}`,
          },
        ],
      })
      setResult(data)
      addTranslationExercise({
        direction,
        tensesUsed: selected,
        sourceText: exercise.source_text,
        idealTranslation: exercise.ideal_translation,
        userTranslation,
        matchPercentage: data.match_percentage,
        aiFeedback: data.feedback,
        grammarErrors: data.grammar_errors ?? [],
      })
      // Prefetch next exercise while the user reads feedback
      if (apiKey.trim() && selected.length > 0) prefetch.start(fetchExercise)
    } catch (e) {
      toast(e instanceof DeepSeekError ? e.message : 'Ошибка проверки', { kind: 'error' })
    } finally {
      setChecking(false)
    }
  }

  const chartData = useMemo(
    () =>
      [...history]
        .reverse()
        .slice(-20)
        .map((h) => ({
          date: formatDate(h.createdAt),
          score: Math.round(h.matchPercentage),
        })),
    [history],
  )

  const byTense = useMemo(() => {
    const map = new Map<string, number[]>()
    for (const h of history) {
      for (const tid of h.tensesUsed) {
        const arr = map.get(tid) ?? []
        arr.push(h.matchPercentage)
        map.set(tid, arr)
      }
    }
    return [...map.entries()]
      .map(([id, scores]) => ({
        id,
        name: TENSES.find((t) => t.id === id)?.nameEn ?? id,
        avg: scores.reduce((a, b) => a + b, 0) / scores.length,
      }))
      .sort((a, b) => a.avg - b.avg)
  }, [history])

  return (
    <div className="animate-fade-in space-y-6">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight">Генерация</h1>
        <p className="mt-1 text-muted-foreground">
          Упражнения на перевод с оценкой сходства через DeepSeek.
        </p>
      </header>

      <AiBanner />

      <Card>
        <CardHeader>
          <CardTitle>Настройки упражнения</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div>
            <div className="mb-2 flex items-center justify-between">
              <Label>Времена</Label>
              <div className="flex gap-2">
                <Button size="sm" variant="ghost" onClick={selectAll}>
                  Все
                </Button>
                <Button size="sm" variant="ghost" onClick={clearAll}>
                  Сброс
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {TENSES.map((t) => (
                <label
                  key={t.id}
                  className="flex cursor-pointer items-center gap-2 rounded-xl border border-border/60 bg-card px-3 py-2 text-sm"
                >
                  <Checkbox
                    checked={selected.includes(t.id)}
                    onCheckedChange={() => toggleTense(t.id)}
                  />
                  {t.nameEn}
                </label>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant={direction === 'ru_to_en' ? 'default' : 'secondary'}
              onClick={() => {
                setDirection('ru_to_en')
                prefetch.clear()
              }}
            >
              RU → EN
            </Button>
            <Button
              size="sm"
              variant={direction === 'en_to_ru' ? 'default' : 'secondary'}
              onClick={() => {
                setDirection('en_to_ru')
                prefetch.clear()
              }}
            >
              EN → RU
            </Button>
            <Button
              size="sm"
              variant={length === 'sentence' ? 'default' : 'secondary'}
              onClick={() => {
                setLength('sentence')
                prefetch.clear()
              }}
            >
              Предложение
            </Button>
            <Button
              size="sm"
              variant={length === 'paragraph' ? 'default' : 'secondary'}
              onClick={() => {
                setLength('paragraph')
                prefetch.clear()
              }}
            >
              Абзац
            </Button>
            {(['A1', 'A2', 'B1', 'B2', 'C1'] as CefrLevel[]).map((l) => (
              <Button
                key={l}
                size="sm"
                variant={level === l ? 'default' : 'outline'}
                onClick={() => {
                  setLevel(l)
                  prefetch.clear()
                }}
              >
                {l}
              </Button>
            ))}
          </div>

          <Button onClick={() => void generate()} disabled={loading || !apiKey}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {exercise && result ? 'Следующее упражнение' : 'Сгенерировать текст'}
          </Button>
        </CardContent>
      </Card>

      {exercise && (
        <Card>
          <CardHeader>
            <CardTitle>Исходный текст</CardTitle>
            <CardDescription>Эталонный перевод скрыт до проверки.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-2xl bg-muted/40 p-4 whitespace-pre-wrap">{exercise.source_text}</div>
            <Textarea
              value={userTranslation}
              onChange={(e) => setUserTranslation(e.target.value)}
              placeholder="Ваш перевод…"
              className="min-h-[120px]"
              disabled={!!result}
            />
            {!result ? (
              <Button onClick={() => void check()} disabled={checking || !userTranslation.trim()}>
                {checking ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Проверить'}
              </Button>
            ) : (
              <div className="space-y-3 rounded-2xl border border-border/60 bg-card p-4">
                <div className="text-3xl font-semibold">{formatPercent(result.match_percentage)}</div>
                <p className="text-sm whitespace-pre-wrap">{result.feedback}</p>
                {result.grammar_errors?.length > 0 && (
                  <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                    {result.grammar_errors.map((e) => (
                      <li key={e}>{e}</li>
                    ))}
                  </ul>
                )}
                <details className="text-sm">
                  <summary className="cursor-pointer text-accent">Показать эталон</summary>
                  <p className="mt-2 whitespace-pre-wrap text-muted-foreground">
                    {exercise.ideal_translation}
                  </p>
                </details>
                <Button onClick={() => void generate()} disabled={loading || !apiKey}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  Дальше
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {chartData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Прогресс сходимости</CardTitle>
            <CardDescription>Последние упражнения</CardDescription>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line type="monotone" dataKey="score" stroke="var(--color-accent)" strokeWidth={2} dot />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {byTense.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Сложность по временам</CardTitle>
            <CardDescription>Средний % — от самых сложных</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {byTense.map((t) => (
              <div
                key={t.id}
                className="flex items-center justify-between rounded-xl border border-border/50 px-3 py-2 text-sm"
              >
                <span>{t.name}</span>
                <Badge>{formatPercent(t.avg)}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

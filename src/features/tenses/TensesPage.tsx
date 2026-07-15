import { useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Loader2, Send, Sparkles } from 'lucide-react'
import { AiBanner } from '@/components/AiBanner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/input'
import { toast } from '@/stores/toast-store'
import { TENSES, getTense, tenseBaseTheoryText } from '@/data/tenses'
import { DeepSeekError, deepseekChat, deepseekJson } from '@/lib/deepseek'
import { PrefetchSlot } from '@/lib/prefetch'
import { useAppStore } from '@/stores/app-store'
import { formatDate, formatPercent } from '@/lib/utils'

export function TensesListPage() {
  const progressFor = useAppStore((s) => s.progressFor)

  return (
    <div className="animate-fade-in space-y-6">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight">Времена</h1>
        <p className="mt-1 text-muted-foreground">
          Теория по 12 временам и практика с проверкой через DeepSeek.
        </p>
      </header>
      <AiBanner />
      <div className="grid gap-3 sm:grid-cols-2">
        {TENSES.map((t) => {
          const p = progressFor(t.id)
          return (
            <Link
              key={t.id}
              to={`/tenses/${t.id}`}
              className="rounded-2xl border border-border/70 bg-card p-5 shadow-sm transition-colors hover:bg-muted/30"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-semibold">{t.nameEn}</div>
                  <div className="text-sm text-muted-foreground">{t.nameRu}</div>
                </div>
                {p.theoryRead && <Badge>Теория</Badge>}
              </div>
              <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                <span>{p.attempts} попыток</span>
                <span>{formatPercent(p.practiceScore)}</span>
              </div>
              <Progress value={p.practiceScore} className="mt-2" />
            </Link>
          )
        })}
      </div>
    </div>
  )
}

export function TenseDetailPage() {
  const { tenseId = '' } = useParams()
  const tense = getTense(tenseId)
  const apiKey = useAppStore((s) => s.settings.deepseekApiKey)
  const markTheoryRead = useAppStore((s) => s.markTheoryRead)
  const progressFor = useAppStore((s) => s.progressFor)
  const chatFor = useAppStore((s) => s.chatFor)
  const addChatMessage = useAppStore((s) => s.addChatMessage)
  const clearChat = useAppStore((s) => s.clearChat)
  const recordTensePractice = useAppStore((s) => s.recordTensePractice)
  const [question, setQuestion] = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  const progress = progressFor(tenseId)
  const history = chatFor(tenseId)

  if (!tense) {
    return (
      <div className="space-y-4">
        <p>Время не найдено.</p>
        <Button asChild variant="secondary">
          <Link to="/tenses">Назад</Link>
        </Button>
      </div>
    )
  }

  const askAi = async (prompt: string) => {
    if (!apiKey.trim()) {
      toast('Проверьте API-ключ DeepSeek в настройках', { kind: 'error' })
      return
    }
    setChatLoading(true)
    addChatMessage(tenseId, 'user', prompt)
    try {
      const reply = await deepseekChat({
        apiKey,
        messages: [
          {
            role: 'system',
            content: `Ты — преподаватель английского языка. Пользователь изучает время: ${tense.nameEn} (${tense.nameRu}).
Базовая теория, которую он уже видел:
${tenseBaseTheoryText(tense)}
Отвечай кратко, по делу, с примерами. Если просят предложения — генерируй новые, не повторяй уже использованные в этом диалоге. Отвечай на русском, примеры — на английском.`,
          },
          ...history.map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content })),
          { role: 'user', content: prompt },
        ],
      })
      addChatMessage(tenseId, 'assistant', reply)
      markTheoryRead(tenseId)
    } catch (e) {
      toast(e instanceof DeepSeekError ? e.message : 'Ошибка ИИ', { kind: 'error' })
    } finally {
      setChatLoading(false)
    }
  }

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="icon">
          <Link to="/tenses">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">{tense.nameEn}</h1>
          <p className="text-muted-foreground">{tense.nameRu}</p>
        </div>
      </div>

      <AiBanner />

      <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
        <span>Практика: {formatPercent(progress.practiceScore)}</span>
        <span>·</span>
        <span>{progress.attempts} попыток</span>
        {progress.lastPracticedAt && (
          <>
            <span>·</span>
            <span>последняя: {formatDate(progress.lastPracticedAt)}</span>
          </>
        )}
      </div>
      <Progress value={progress.practiceScore} />

      <Tabs defaultValue="theory">
        <TabsList>
          <TabsTrigger value="theory">Теория</TabsTrigger>
          <TabsTrigger value="practice">Практика</TabsTrigger>
        </TabsList>

        <TabsContent value="theory" className="space-y-5">
          <Card>
            <CardHeader>
              <CardTitle>Формула</CardTitle>
              <CardDescription className="font-mono text-base text-foreground">
                {tense.formula}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="mb-2 text-sm font-medium">Когда используется</div>
                <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                  {tense.uses.map((u) => (
                    <li key={u}>{u}</li>
                  ))}
                </ul>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <Example label="+" text={tense.examples.affirmative} />
                <Example label="−" text={tense.examples.negative} />
                <Example label="?" text={tense.examples.question} />
              </div>
              <div className="flex flex-wrap gap-2">
                {tense.markers.map((m) => (
                  <Badge key={m}>{m}</Badge>
                ))}
              </div>
              <Button variant="secondary" onClick={() => markTheoryRead(tenseId)}>
                Отметить теорию прочитанной
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-accent" /> Спроси у ИИ
              </CardTitle>
              <CardDescription>История диалога сохраняется для этого времени.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {[
                  'Сгенерируй 5 примеров',
                  'Объясни на простом языке',
                  'Сравни с Past Simple',
                  'Дай упражнение',
                ].map((q) => (
                  <Button
                    key={q}
                    size="sm"
                    variant="secondary"
                    disabled={chatLoading || !apiKey}
                    onClick={() => askAi(q)}
                  >
                    {q}
                  </Button>
                ))}
              </div>

              <div className="max-h-80 space-y-3 overflow-y-auto rounded-2xl bg-muted/40 p-4">
                {history.length === 0 && (
                  <p className="text-sm text-muted-foreground">Пока нет сообщений.</p>
                )}
                {history.map((m) => (
                  <div
                    key={m.id}
                    className={`rounded-xl px-3 py-2 text-sm whitespace-pre-wrap ${
                      m.role === 'user' ? 'ml-8 bg-accent-soft text-foreground' : 'mr-8 bg-card'
                    }`}
                  >
                    {m.content}
                  </div>
                ))}
              </div>

              <form
                className="flex gap-2"
                onSubmit={(e) => {
                  e.preventDefault()
                  if (!question.trim()) return
                  const q = question.trim()
                  setQuestion('')
                  void askAi(q)
                }}
              >
                <Textarea
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Спросите что угодно об этом времени…"
                  className="min-h-[44px]"
                />
                <Button type="submit" disabled={chatLoading || !apiKey} size="icon" className="shrink-0">
                  {chatLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
              </form>
              {history.length > 0 && (
                <Button variant="ghost" size="sm" onClick={() => clearChat(tenseId)}>
                  Очистить историю
                </Button>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="practice">
          <TensePractice
            tenseId={tenseId}
            tenseName={tense.nameEn}
            apiKey={apiKey}
            onResult={(ok) => recordTensePractice(tenseId, ok)}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function Example({ label, text }: { label: string; text: string }) {
  return (
    <div className="rounded-xl bg-muted/50 p-3">
      <div className="mb-1 text-xs font-semibold text-accent">{label}</div>
      <div className="text-sm">{text}</div>
    </div>
  )
}

type PracticeKind = 'cards' | 'input' | 'identify' | 'transform'

interface GeneratedExercise {
  kind: PracticeKind
  prompt: string
  options?: string[]
  answer: string
  explanation: string
}

function TensePractice({
  tenseId,
  tenseName,
  apiKey,
  onResult,
}: {
  tenseId: string
  tenseName: string
  apiKey: string
  onResult: (correct: boolean) => void
}) {
  const [kind, setKind] = useState<PracticeKind>('cards')
  const [loading, setLoading] = useState(false)
  const [exercise, setExercise] = useState<GeneratedExercise | null>(null)
  const [answer, setAnswer] = useState('')
  const [feedback, setFeedback] = useState<string | null>(null)
  const [checking, setChecking] = useState(false)
  const prefetch = useRef(new PrefetchSlot<GeneratedExercise>()).current

  const fetchExercise = async () =>
    deepseekJson<GeneratedExercise>({
      apiKey,
      temperature: 0.8,
      messages: [
        {
          role: 'system',
          content: `Ты генератор упражнений по английским временам. Верни только JSON.
Схема: {
  "kind": "${kind}",
  "prompt": "текст задания",
  "options": ["..."] // только для cards и identify, ровно 4 варианта,
  "answer": "правильный ответ",
  "explanation": "краткое пояснение на русском"
}
Время: ${tenseName} (id: ${tenseId}).
Для cards: русское предложение → 4 английских перевода, 1 верный.
Для input: предложение с пропуском и глаголом в скобках.
Для identify: английское предложение → угадать время (options = 4 названия времён включая верное).
Для transform: переписать предложение в ${tenseName}.`,
        },
        { role: 'user', content: `Сгенерируй одно упражнение типа ${kind}.` },
      ],
    })

  const generate = async () => {
    if (!apiKey.trim()) {
      toast('Проверьте API-ключ DeepSeek в настройках', { kind: 'error' })
      return
    }
    setLoading(true)
    setFeedback(null)
    setAnswer('')
    try {
      const data = await prefetch.take(fetchExercise)
      setExercise(data)
    } catch (e) {
      toast(e instanceof DeepSeekError ? e.message : 'Ошибка генерации', { kind: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const check = async (userAnswer: string) => {
    if (!exercise) return
    setChecking(true)
    try {
      if (kind === 'cards' || kind === 'identify') {
        const ok = userAnswer.trim() === exercise.answer.trim()
        onResult(ok)
        setFeedback(
          ok
            ? `Верно! ${exercise.explanation}`
            : `Неверно. Правильно: ${exercise.answer}. ${exercise.explanation}`,
        )
      } else {
        const result = await deepseekJson<{ correct: boolean; feedback: string }>({
          apiKey,
          temperature: 0.2,
          messages: [
            {
              role: 'system',
              content:
                'Оцени ответ ученика по упражнению на английские времена. Верни JSON: {"correct": boolean, "feedback": "кратко на русском"}',
            },
            {
              role: 'user',
              content: `Задание: ${exercise.prompt}\nЭталон: ${exercise.answer}\nОтвет ученика: ${userAnswer}`,
            },
          ],
        })
        onResult(result.correct)
        setFeedback(result.feedback)
      }
      // Prefetch next exercise as soon as the current one is answered
      if (apiKey.trim()) prefetch.start(fetchExercise)
    } catch (e) {
      toast(e instanceof DeepSeekError ? e.message : 'Ошибка проверки', { kind: 'error' })
    } finally {
      setChecking(false)
    }
  }

  const kinds = useMemo(
    () =>
      [
        { id: 'cards' as const, label: 'Карточки' },
        { id: 'input' as const, label: 'Инпут' },
        { id: 'identify' as const, label: 'Определение' },
        { id: 'transform' as const, label: 'Трансформация' },
      ] as const,
    [],
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>Практика</CardTitle>
        <CardDescription>Упражнения генерируются ИИ по выбранному формату.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {kinds.map((k) => (
            <Button
              key={k.id}
              size="sm"
              variant={kind === k.id ? 'default' : 'secondary'}
              onClick={() => {
                setKind(k.id)
                setExercise(null)
                setFeedback(null)
                prefetch.clear()
              }}
            >
              {k.label}
            </Button>
          ))}
        </div>

        <Button onClick={() => void generate()} disabled={loading || !apiKey}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {exercise && feedback ? 'Следующее упражнение' : 'Сгенерировать упражнение'}
        </Button>

        {exercise && (
          <div className="space-y-4 rounded-2xl border border-border/60 bg-muted/30 p-4">
            <p className="whitespace-pre-wrap text-sm font-medium">{exercise.prompt}</p>

            {exercise.options && (kind === 'cards' || kind === 'identify') ? (
              <div className="grid gap-2">
                {exercise.options.map((opt) => (
                  <Button
                    key={opt}
                    variant="outline"
                    className="h-auto justify-start whitespace-normal py-3 text-left"
                    disabled={!!feedback || checking}
                    onClick={() => void check(opt)}
                  >
                    {opt}
                  </Button>
                ))}
              </div>
            ) : (
              <div className="flex gap-2">
                <Textarea
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="Ваш ответ…"
                  disabled={!!feedback}
                />
                <Button
                  disabled={!answer.trim() || !!feedback || checking}
                  onClick={() => void check(answer)}
                >
                  {checking ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Проверить'}
                </Button>
              </div>
            )}

            {feedback && (
              <div className="rounded-xl bg-card p-3 text-sm whitespace-pre-wrap">{feedback}</div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

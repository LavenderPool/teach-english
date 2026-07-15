import { useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Loader2, Plus, Volume2 } from 'lucide-react'
import { AiBanner } from '@/components/AiBanner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from '@/stores/toast-store'
import { StudySession } from '@/features/words/StudySession'
import { DeepSeekError, deepseekJson } from '@/lib/deepseek'
import { PrefetchSlot } from '@/lib/prefetch'
import type { CefrLevel } from '@/lib/types'
import { speak } from '@/lib/tts'
import { useAppStore } from '@/stores/app-store'

type ArcadeWord = {
  word: string
  translation: string
  transcription: string
  example?: string
}

export function WordsPage() {
  const cards = useAppStore((s) => s.cards)
  const addCard = useAppStore((s) => s.addCard)
  const removeCard = useAppStore((s) => s.removeCard)
  const importSeedDictionary = useAppStore((s) => s.importSeedDictionary)
  const importMetaphorsLibrary = useAppStore((s) => s.importMetaphorsLibrary)
  const apiKey = useAppStore((s) => s.settings.deepseekApiKey)
  const [word, setWord] = useState('')
  const [translation, setTranslation] = useState('')
  const [category, setCategory] = useState('General')
  const [topic, setTopic] = useState('')
  const [genLoading, setGenLoading] = useState(false)

  const categories = useMemo(() => {
    const set = new Set(cards.map((c) => c.category || 'General'))
    return Array.from(set).sort()
  }, [cards])

  const generateByTopic = async () => {
    if (!topic.trim()) return
    if (!apiKey.trim()) {
      toast('Проверьте API-ключ DeepSeek в настройках', { kind: 'error' })
      return
    }
    setGenLoading(true)
    try {
      const data = await deepseekJson<{
        words: { word: string; translation: string; transcription: string; example_en?: string }[]
      }>({
        apiKey,
        messages: [
          {
            role: 'system',
            content:
              'Сгенерируй список английских слов по теме. Верни JSON: {"words":[{"word":"","translation":"","transcription":"/.../","example_en":""}]}',
          },
          {
            role: 'user',
            content: `Сгенерируй 20 слов по теме: ${topic}. Уровень B1-B2. Перевод на русский.`,
          },
        ],
      })
      let added = 0
      for (const w of data.words ?? []) {
        if (!w.word || !w.translation) continue
        addCard({
          word: w.word,
          translation: w.translation,
          transcription: w.transcription,
          exampleEn: w.example_en,
          category: topic,
          source: 'imported',
        })
        added++
      }
      toast(`Добавлено ${added} слов`, { kind: 'success' })
      setTopic('')
    } catch (e) {
      toast(e instanceof DeepSeekError ? e.message : 'Ошибка генерации', { kind: 'error' })
    } finally {
      setGenLoading(false)
    }
  }

  return (
    <div className="animate-fade-in space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="page-title text-3xl font-semibold tracking-tight">Слова</h1>
          <p className="mt-1 text-muted-foreground">
            SRS-карточки (SM-2) и аркада с проверкой через ИИ.
          </p>
        </div>
        <Button asChild variant="secondary">
          <Link to="/words/arcade">Аркада</Link>
        </Button>
      </header>

      <AiBanner />

      <Tabs defaultValue="study">
        <TabsList>
          <TabsTrigger value="study">Изучение</TabsTrigger>
          <TabsTrigger value="deck">Колода ({cards.length})</TabsTrigger>
          <TabsTrigger value="add">Добавить</TabsTrigger>
        </TabsList>

        <TabsContent value="study">
          <StudySession />
        </TabsContent>

        <TabsContent value="deck" className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button
              variant="secondary"
              onClick={() => {
                void (async () => {
                  toast('Загружаем словарь…', { kind: 'info' })
                  try {
                    const n = await importSeedDictionary()
                    toast(n ? `Импортировано ${n} слов` : 'Все слова уже в колоде', {
                      kind: n ? 'success' : 'info',
                    })
                  } catch {
                    toast('Не удалось загрузить словарь', { kind: 'error' })
                  }
                })()
              }}
            >
              Загрузить базовый словарь (~5500)
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                void (async () => {
                  toast('Загружаем библиотеку метафор…', { kind: 'info' })
                  try {
                    const n = await importMetaphorsLibrary()
                    toast(
                      n
                        ? `Импортировано ${n} метафор и словосочетаний`
                        : 'Все метафоры уже в колоде',
                      { kind: n ? 'success' : 'info' },
                    )
                  } catch {
                    toast('Не удалось загрузить библиотеку метафор', { kind: 'error' })
                  }
                })()
              }}
            >
              Библиотека метафор (500)
            </Button>
          </div>
          {categories.map((cat) => (
            <div key={cat}>
              <h3 className="mb-2 text-sm font-medium text-muted-foreground">{cat}</h3>
              <div className="space-y-2">
                {cards
                  .filter((c) => (c.category || 'General') === cat)
                  .map((c) => (
                    <div
                      key={c.id}
                      className="glass flex items-center justify-between gap-3 rounded-3xl px-4 py-3"
                    >
                      <div>
                        <div className="font-medium">
                          {c.word}{' '}
                          <span className="text-sm font-normal text-muted-foreground">
                            — {c.translation}
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {c.transcription || '—'} · интервал {c.intervalDays}д
                          {c.mastered ? ' · освоено' : ''}
                        </div>
                      </div>
                      <Button size="sm" variant="ghost" onClick={() => removeCard(c.id)}>
                        Удалить
                      </Button>
                    </div>
                  ))}
              </div>
            </div>
          ))}
          {cards.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Колода пуста — добавьте слова вручную или импортируйте словарь.
            </p>
          )}
        </TabsContent>

        <TabsContent value="add" className="space-y-5">
          <Card>
            <CardHeader>
              <CardTitle>Новая карточка</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>Слово (EN)</Label>
                  <Input value={word} onChange={(e) => setWord(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label>Перевод (RU)</Label>
                  <Input value={translation} onChange={(e) => setTranslation(e.target.value)} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Категория</Label>
                <Input value={category} onChange={(e) => setCategory(e.target.value)} />
              </div>
              <Button
                onClick={() => {
                  if (!word.trim() || !translation.trim()) return
                  addCard({ word: word.trim(), translation: translation.trim(), category })
                  setWord('')
                  setTranslation('')
                  toast('Карточка добавлена', { kind: 'success' })
                }}
              >
                <Plus className="h-4 w-4" /> Добавить
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Сгенерировать по теме (ИИ)</CardTitle>
              <CardDescription>Например: IT, Travel, Phrasal Verbs</CardDescription>
            </CardHeader>
            <CardContent className="flex gap-2">
              <Input
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Тема…"
                disabled={!apiKey}
              />
              <Button onClick={() => void generateByTopic()} disabled={genLoading || !apiKey}>
                {genLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : '20 слов'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export function ArcadePage() {
  const apiKey = useAppStore((s) => s.settings.deepseekApiKey)
  const settings = useAppStore((s) => s.settings)
  const updateSettings = useAppStore((s) => s.updateSettings)
  const addCard = useAppStore((s) => s.addCard)
  const rememberArcadeWord = useAppStore((s) => s.rememberArcadeWord)
  const seen = useAppStore((s) => s.arcadeSeenWords)
  const voice = settings.ttsVoice
  const rate = settings.ttsRate

  const [loading, setLoading] = useState(false)
  const [word, setWord] = useState<ArcadeWord | null>(null)
  const [answer, setAnswer] = useState('')
  const [result, setResult] = useState<{ correct: boolean; feedback: string } | null>(null)
  const [streak, setStreak] = useState(0)
  const [checking, setChecking] = useState(false)
  const prefetch = useRef(new PrefetchSlot<ArcadeWord>()).current

  const fetchWord = async () => {
    const data = await deepseekJson<ArcadeWord>({
      apiKey,
      temperature: 0.9,
      messages: [
        {
          role: 'system',
          content:
            'Сгенерируй одно английское слово для словарной аркады. Верни JSON: {"word":"","translation":"","transcription":"/.../","example":""}. Не повторяй слова из списка seen.',
        },
        {
          role: 'user',
          content: `Уровень: ${settings.arcadeLevel}. Тема: ${settings.arcadeTopic || 'общая'}. Уже показаны: ${seen.slice(-40).join(', ') || 'нет'}`,
        },
      ],
    })
    return data
  }

  const nextWord = async () => {
    if (!apiKey.trim()) {
      toast('Проверьте API-ключ DeepSeek в настройках', { kind: 'error' })
      return
    }
    setLoading(true)
    setResult(null)
    setAnswer('')
    try {
      const data = await prefetch.take(fetchWord)
      setWord(data)
      rememberArcadeWord(data.word)
      speak(data.word, { voiceURI: voice, rate })
    } catch (e) {
      toast(e instanceof DeepSeekError ? e.message : 'Ошибка генерации', { kind: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const check = async () => {
    if (!word || !answer.trim()) return
    setChecking(true)
    try {
      const res = await deepseekJson<{ correct: boolean; feedback: string }>({
        apiKey,
        temperature: 0.2,
        messages: [
          {
            role: 'system',
            content:
              'Проверь перевод английского слова на русский. Учитывай синонимы. Верни JSON: {"correct":boolean,"feedback":"кратко"}',
          },
          {
            role: 'user',
            content: `Слово: ${word.word}\nЭталон: ${word.translation}\nОтвет: ${answer}`,
          },
        ],
      })
      setResult(res)
      if (res.correct) setStreak((s) => s + 1)
      else setStreak(0)
      // Instantly start generating the next word in the background
      prefetch.start(fetchWord)
    } catch (e) {
      toast(e instanceof DeepSeekError ? e.message : 'Ошибка проверки', { kind: 'error' })
    } finally {
      setChecking(false)
    }
  }

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="page-title text-3xl font-semibold tracking-tight">Аркада</h1>
          <p className="mt-1 text-muted-foreground">Случайные слова · серия: {streak}</p>
        </div>
        <Button asChild variant="ghost">
          <Link to="/words">К карточкам</Link>
        </Button>
      </div>

      <AiBanner />

      <Card>
        <CardContent className="grid gap-3 pt-6 sm:grid-cols-3">
          <div className="space-y-1.5">
            <Label>Уровень</Label>
            <select
              className="flex h-10 w-full rounded-2xl border border-border/80 bg-white/40 px-3 text-sm backdrop-blur-xl dark:bg-white/8"
              value={settings.arcadeLevel}
              onChange={(e) => updateSettings({ arcadeLevel: e.target.value as CefrLevel })}
            >
              {(['A1', 'A2', 'B1', 'B2', 'C1'] as CefrLevel[]).map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label>Тема (опционально)</Label>
            <Input
              value={settings.arcadeTopic}
              onChange={(e) => updateSettings({ arcadeTopic: e.target.value })}
              placeholder="Travel, IT…"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Таймер (сек, 0 = выкл)</Label>
            <Input
              type="number"
              min={0}
              value={settings.arcadeTimerSec}
              onChange={(e) => updateSettings({ arcadeTimerSec: Number(e.target.value) || 0 })}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="min-h-[300px]">
        <CardContent className="flex flex-col items-center justify-center gap-4 px-6 py-12 text-center">
          {!word && (
            <Button onClick={() => void nextWord()} disabled={loading || !apiKey}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Начать'}
            </Button>
          )}
          {word && (
            <>
              <div className="text-3xl font-semibold">{word.word}</div>
              <div className="font-mono text-muted-foreground">{word.transcription}</div>
              <Button variant="ghost" size="sm" onClick={() => speak(word.word, { voiceURI: voice, rate })}>
                <Volume2 className="h-4 w-4" />
              </Button>
              {!result ? (
                <div className="flex w-full max-w-md gap-2">
                  <Input
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    placeholder="Перевод на русский…"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') void check()
                    }}
                  />
                  <Button onClick={() => void check()} disabled={checking}>
                    {checking ? <Loader2 className="h-4 w-4 animate-spin" /> : 'OK'}
                  </Button>
                </div>
              ) : (
                <div className="w-full max-w-md space-y-3">
                  <div
                    className={`rounded-xl p-3 text-sm ${result.correct ? 'bg-success/15' : 'bg-danger/10'}`}
                  >
                    {result.correct ? 'Верно!' : `Неверно. Эталон: ${word.translation}`}
                    <div className="mt-1 text-muted-foreground">{result.feedback}</div>
                  </div>
                  {!result.correct && (
                    <Button
                      variant="secondary"
                      onClick={() => {
                        addCard({
                          word: word.word,
                          translation: word.translation,
                          transcription: word.transcription,
                          exampleEn: word.example,
                          source: 'arcade_mistake',
                          category: settings.arcadeTopic || settings.arcadeLevel,
                        })
                        toast('Добавлено в карточки', { kind: 'success' })
                      }}
                    >
                      Добавить в карточки для повторения
                    </Button>
                  )}
                  <Button onClick={() => void nextWord()} disabled={loading}>
                    Следующее слово
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

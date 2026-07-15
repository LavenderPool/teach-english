import { useMemo, useRef, useState } from 'react'
import { Loader2, Volume2 } from 'lucide-react'
import { AiBanner } from '@/components/AiBanner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from '@/stores/toast-store'
import { IPA_KEYBOARD, IPA_SYMBOLS, type IpaKind } from '@/data/ipa'
import { DeepSeekError, deepseekJson } from '@/lib/deepseek'
import { PrefetchSlot } from '@/lib/prefetch'
import { speak } from '@/lib/tts'
import { ipaMatch } from '@/lib/utils'
import { useAppStore } from '@/stores/app-store'

type TranscriptionItem = {
  word: string
  ipa: string
  example_sentence: string
  distractors?: string[]
}

export function TranscriptionPage() {
  return (
    <div className="animate-fade-in space-y-6">
      <header>
        <h1 className="page-title text-[2.2rem] leading-none">Транскрипция</h1>
        <p className="mt-2 text-[14px] text-muted-foreground">
          IPA-символы и практика произношения с виртуальной клавиатурой.
        </p>
      </header>
      <AiBanner />
      <Tabs defaultValue="theory">
        <TabsList>
          <TabsTrigger value="theory">Теория</TabsTrigger>
          <TabsTrigger value="practice">Практика</TabsTrigger>
        </TabsList>
        <TabsContent value="theory">
          <IpaTheory />
        </TabsContent>
        <TabsContent value="practice">
          <IpaPractice />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function IpaTheory() {
  const [filter, setFilter] = useState<IpaKind | 'all'>('all')
  const isIpaLearned = useAppStore((s) => s.isIpaLearned)
  const setIpaLearned = useAppStore((s) => s.setIpaLearned)
  const voice = useAppStore((s) => s.settings.ttsVoice)
  const rate = useAppStore((s) => s.settings.ttsRate)

  const list = useMemo(
    () => IPA_SYMBOLS.filter((s) => filter === 'all' || s.kind === filter),
    [filter],
  )

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {(
          [
            ['all', 'Все'],
            ['vowel', 'Гласные'],
            ['consonant', 'Согласные'],
            ['diphthong', 'Дифтонги'],
          ] as const
        ).map(([id, label]) => (
          <Button
            key={id}
            size="sm"
            variant={filter === id ? 'default' : 'secondary'}
            onClick={() => setFilter(id)}
          >
            {label}
          </Button>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {list.map((item) => {
          const learned = isIpaLearned(item.symbol)
          return (
            <Card key={item.symbol}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="font-mono text-2xl">/{item.symbol}/</CardTitle>
                  <Badge className="capitalize">{item.kind}</Badge>
                </div>
                <CardDescription>{item.tipRu}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1.5">
                  {item.examples.map((ex) => (
                    <button
                      key={ex.word}
                      type="button"
                      className="flex w-full items-center justify-between rounded-xl bg-muted/80 px-3 py-2 text-left text-[13px] transition-colors hover:bg-muted"
                      onClick={() => speak(ex.word, { voiceURI: voice, rate })}
                    >
                      <span>
                        {ex.word} <span className="font-mono text-muted-foreground">[{ex.ipa}]</span>
                      </span>
                      <Volume2 className="h-3.5 w-3.5 text-muted-foreground" />
                    </button>
                  ))}
                </div>
                <label className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={learned}
                    onCheckedChange={(v) => setIpaLearned(item.symbol, v === true)}
                  />
                  Выучено
                </label>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

function IpaPractice() {
  const apiKey = useAppStore((s) => s.settings.deepseekApiKey)
  const addTranscriptionAttempt = useAppStore((s) => s.addTranscriptionAttempt)
  const addCard = useAppStore((s) => s.addCard)
  const voice = useAppStore((s) => s.settings.ttsVoice)
  const rate = useAppStore((s) => s.settings.ttsRate)

  const [mode, setMode] = useState<'input' | 'cards'>('input')
  const [loading, setLoading] = useState(false)
  const [item, setItem] = useState<TranscriptionItem | null>(null)
  const [value, setValue] = useState('')
  const [done, setDone] = useState<{ correct: boolean } | null>(null)
  const prefetch = useRef(new PrefetchSlot<TranscriptionItem>()).current

  const fetchItem = async () =>
    deepseekJson<TranscriptionItem>({
      apiKey,
      temperature: 0.85,
      messages: [
        {
          role: 'system',
          content:
            mode === 'cards'
              ? 'Сгенерируй английское слово B1-B2 и IPA. Верни JSON: {"word":"","ipa":"...","example_sentence":"","distractors":["похожая1","похожая2","похожая3"]} — distractors без слэшей, похожие на верную транскрипцию.'
              : 'Сгенерируй одно английское слово среднего уровня (B1-B2). Верни JSON: { "word": "...", "ipa": "...", "example_sentence": "..." }. ipa без внешних слэшей.',
        },
        { role: 'user', content: 'Сгенерируй задание на транскрипцию.' },
      ],
    })

  const generate = async () => {
    if (!apiKey.trim()) {
      toast('Проверьте API-ключ DeepSeek в настройках', { kind: 'error' })
      return
    }
    setLoading(true)
    setDone(null)
    setValue('')
    try {
      const data = await prefetch.take(fetchItem)
      setItem(data)
      speak(data.word, { voiceURI: voice, rate })
    } catch (e) {
      toast(e instanceof DeepSeekError ? e.message : 'Ошибка генерации', { kind: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const submit = (userAnswer: string) => {
    if (!item) return
    const correct = ipaMatch(userAnswer, item.ipa)
    setDone({ correct })
    addTranscriptionAttempt({
      audioWord: item.word,
      correctTranscription: item.ipa,
      userAnswer,
      isCorrect: correct,
    })
    if (!correct) {
      addCard({
        word: item.word,
        translation: '(транскрипция)',
        transcription: `/${item.ipa}/`,
        exampleEn: item.example_sentence,
        source: 'transcription_mistake',
        category: 'Pronunciation',
      })
    }
    // Start next exercise immediately in the background
    if (apiKey.trim()) prefetch.start(fetchItem)
  }

  const options = useMemo(() => {
    if (!item) return []
    const opts = [item.ipa, ...(item.distractors ?? [])].slice(0, 4)
    return opts.sort(() => Math.random() - 0.5)
  }, [item])

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          variant={mode === 'input' ? 'default' : 'secondary'}
          onClick={() => {
            setMode('input')
            prefetch.clear()
          }}
        >
          Инпут-режим
        </Button>
        <Button
          size="sm"
          variant={mode === 'cards' ? 'default' : 'secondary'}
          onClick={() => {
            setMode('cards')
            prefetch.clear()
          }}
        >
          Карточный режим
        </Button>
        <Button onClick={() => void generate()} disabled={loading || !apiKey}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Новое слово'}
        </Button>
      </div>

      {item && (
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{item.word}</CardTitle>
            <CardDescription>{item.example_sentence}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="ghost" size="sm" onClick={() => speak(item.word, { voiceURI: voice, rate })}>
              <Volume2 className="h-4 w-4" /> Прослушать
            </Button>

            {mode === 'input' && !done && (
              <>
                <Input
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder="Введите IPA…"
                  className="font-mono"
                />
                <IpaKeyboard onInsert={(s) => setValue((v) => v + s)} onBackspace={() => setValue((v) => v.slice(0, -1))} />
                <Button onClick={() => submit(value)} disabled={!value.trim()}>
                  Проверить
                </Button>
              </>
            )}

            {mode === 'cards' && !done && (
              <div className="grid gap-2 sm:grid-cols-2">
                {options.map((opt) => (
                  <Button
                    key={opt}
                    variant="outline"
                    className="font-mono"
                    onClick={() => submit(opt)}
                  >
                    /{opt}/
                  </Button>
                ))}
              </div>
            )}

            {done && (
              <div className={`rounded-xl p-4 text-sm ${done.correct ? 'bg-success/15' : 'bg-danger/10'}`}>
                <div className="font-medium">{done.correct ? 'Верно!' : 'Неверно'}</div>
                <div className="mt-1 font-mono">Эталон: /{item.ipa}/</div>
                {!done.correct && (
                  <div className="mt-2 text-muted-foreground">
                    Слово добавлено в очередь повторения (карточки).
                  </div>
                )}
                <Button className="mt-3" onClick={() => void generate()}>
                  Дальше
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function IpaKeyboard({
  onInsert,
  onBackspace,
}: {
  onInsert: (s: string) => void
  onBackspace: () => void
}) {
  return (
    <div className="flex flex-wrap gap-1.5 rounded-2xl bg-muted/70 p-3">
      {IPA_KEYBOARD.map((s) => (
        <button
          key={s}
          type="button"
          className="min-w-9 rounded-lg bg-card px-2 py-1.5 font-mono text-[13px] transition-colors hover:bg-accent-soft"
          onClick={() => onInsert(s)}
        >
          {s}
        </button>
      ))}
      <button
        type="button"
        className="rounded-lg bg-card px-3 py-1.5 text-[13px] hover:bg-muted"
        onClick={onBackspace}
      >
        ⌫
      </button>
    </div>
  )
}

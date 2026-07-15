import { useEffect, useState } from 'react'
import { Bell, Eye, EyeOff, ExternalLink, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { toast } from '@/stores/toast-store'
import { DeepSeekError, validateApiKey } from '@/lib/deepseek'
import { openMiniWindow } from '@/lib/mini-window'
import { isTauri } from '@/lib/tauri'
import { englishVoices } from '@/lib/tts'
import type { ThemeMode } from '@/lib/types'
import { downloadJson } from '@/lib/utils'
import { armWordAlarmFromNow, triggerWordAlarmNow } from '@/lib/word-alarm'
import { useAppStore } from '@/stores/app-store'

function formatNextAlarm(ts: number | null, pending: boolean): string {
  if (pending) return 'Ожидает прохождения карточек'
  if (ts == null) return 'Не запланирован'
  const diff = ts - Date.now()
  if (diff <= 0) return 'Сейчас'
  const mins = Math.round(diff / 60_000)
  if (mins < 60) return `через ${mins} мин`
  const hours = Math.floor(mins / 60)
  const rem = mins % 60
  return rem > 0 ? `через ${hours} ч ${rem} мин` : `через ${hours} ч`
}

export function SettingsPage() {
  const settings = useAppStore((s) => s.settings)
  const setTheme = useAppStore((s) => s.setTheme)
  const updateSettings = useAppStore((s) => s.updateSettings)
  const exportData = useAppStore((s) => s.exportData)
  const importData = useAppStore((s) => s.importData)
  const reset = useAppStore((s) => s.reset)
  const desktop = isTauri()

  const [apiKey, setApiKey] = useState(settings.deepseekApiKey)
  const [showKey, setShowKey] = useState(false)
  const [checking, setChecking] = useState(false)
  const [voices, setVoices] = useState(englishVoices())
  const [nowTick, setNowTick] = useState(0)

  useEffect(() => {
    setApiKey(settings.deepseekApiKey)
  }, [settings.deepseekApiKey])

  useEffect(() => {
    const refresh = () => setVoices(englishVoices())
    refresh()
    window.speechSynthesis?.addEventListener?.('voiceschanged', refresh)
    return () => window.speechSynthesis?.removeEventListener?.('voiceschanged', refresh)
  }, [])

  useEffect(() => {
    if (!desktop || !settings.wordAlarmEnabled) return
    const id = window.setInterval(() => setNowTick((n) => n + 1), 30_000)
    return () => window.clearInterval(id)
  }, [desktop, settings.wordAlarmEnabled])

  const saveKey = () => {
    updateSettings({ deepseekApiKey: apiKey.trim() })
    toast('API-ключ сохранён', {
      kind: 'success',
      description:
        'В веб-режиме ключ хранится отдельно от основной БД. В Tauri-сборке рекомендуется Keychain.',
    })
  }

  const testKey = async () => {
    setChecking(true)
    try {
      await validateApiKey(apiKey.trim())
      updateSettings({ deepseekApiKey: apiKey.trim() })
      toast('Ключ валиден', { kind: 'success' })
    } catch (e) {
      toast(e instanceof DeepSeekError ? e.message : 'Ключ не прошёл проверку', { kind: 'error' })
    } finally {
      setChecking(false)
    }
  }

  const toggleAlarm = (enabled: boolean) => {
    if (!desktop) {
      toast('Будильник доступен в macOS-сборке', { kind: 'info' })
      return
    }
    updateSettings({ wordAlarmEnabled: enabled })
    if (enabled) {
      armWordAlarmFromNow()
      toast('Будильник включён', {
        kind: 'success',
        description: `Каждые ${settings.wordAlarmIntervalHours} ч · ${settings.wordAlarmCardsRequired} карточек для перезапуска`,
      })
    } else {
      updateSettings({
        wordAlarmNextAt: null,
        wordAlarmPendingUnlock: false,
        wordAlarmCardsProgress: 0,
      })
    }
  }

  return (
    <div className="animate-fade-in space-y-6">
      <header>
        <h1 className="page-title text-3xl font-semibold tracking-tight">Настройки</h1>
        <p className="mt-1 text-muted-foreground">Тема, DeepSeek API, TTS и данные.</p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Тема</CardTitle>
          <CardDescription>Светлая, тёмная или системная.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {(
            [
              ['light', 'Светлая'],
              ['dark', 'Тёмная'],
              ['system', 'Системная'],
            ] as [ThemeMode, string][]
          ).map(([id, label]) => (
            <Button
              key={id}
              variant={settings.theme === id ? 'default' : 'secondary'}
              onClick={() => setTheme(id)}
            >
              {label}
            </Button>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Будильник слов (macOS)
          </CardTitle>
          <CardDescription>
            Каждые X часов — уведомление со случайным коротким словом (до трёх в баннере). По нажатию
            открывается мини-окно с переводом. Чтобы снова включить будильник, пройдите N карточек.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-sm font-medium">Включить будильник</div>
              <div className="text-xs text-muted-foreground">
                {desktop
                  ? `Следующий: ${formatNextAlarm(settings.wordAlarmNextAt, settings.wordAlarmPendingUnlock)}`
                  : 'Только в Tauri / macOS сборке'}
              </div>
            </div>
            <Switch
              checked={settings.wordAlarmEnabled}
              onCheckedChange={toggleAlarm}
              disabled={!desktop}
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <NumberField
              label="Интервал (часы)"
              value={settings.wordAlarmIntervalHours}
              onChange={(v) => {
                updateSettings({ wordAlarmIntervalHours: v })
                if (settings.wordAlarmEnabled && !settings.wordAlarmPendingUnlock) {
                  updateSettings({
                    wordAlarmNextAt: Date.now() + v * 60 * 60 * 1000,
                  })
                }
              }}
            />
            <NumberField
              label="Карточек для перезапуска"
              value={settings.wordAlarmCardsRequired}
              onChange={(v) => updateSettings({ wordAlarmCardsRequired: v })}
            />
          </div>

          {settings.wordAlarmPendingUnlock && (
            <p className="text-sm text-muted-foreground">
              Прогресс: {settings.wordAlarmCardsProgress}/{settings.wordAlarmCardsRequired} карточек
            </p>
          )}

          <div className="flex flex-wrap gap-2">
            <Button
              variant="secondary"
              disabled={!desktop}
              onClick={() => void openMiniWindow(settings.wordAlarmLastWordId ?? undefined)}
            >
              Открыть мини-окно
            </Button>
            <Button
              variant="outline"
              disabled={!desktop || !settings.wordAlarmEnabled}
              onClick={() => {
                void triggerWordAlarmNow().then(() =>
                  toast('Уведомление отправлено', { kind: 'success' }),
                )
              }}
            >
              Проверить сейчас
            </Button>
          </div>
          <span className="sr-only">{nowTick}</span>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>AI Provider · DeepSeek</CardTitle>
          <CardDescription>
            Ключ не сохраняется в экспорте БД. Получить ключ:{' '}
            <a
              href="https://platform.deepseek.com"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-accent hover:underline"
            >
              platform.deepseek.com <ExternalLink className="h-3 w-3" />
            </a>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Label>API Key</Label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-…"
                className="pr-10"
                autoComplete="off"
              />
              <button
                type="button"
                className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground"
                onClick={() => setShowKey((v) => !v)}
              >
                {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <Button variant="secondary" onClick={saveKey}>
              Сохранить
            </Button>
            <Button onClick={() => void testKey()} disabled={checking || !apiKey.trim()}>
              {checking ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Проверить ключ'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Голос TTS</CardTitle>
          <CardDescription>Системный Web Speech API / AVSpeechSynthesizer в macOS.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Голос</Label>
            <select
              className="flex h-10 w-full rounded-2xl border border-border/80 bg-white/40 px-3 text-sm backdrop-blur-xl dark:bg-white/8"
              value={settings.ttsVoice}
              onChange={(e) => updateSettings({ ttsVoice: e.target.value })}
            >
              <option value="">По умолчанию (EN)</option>
              {voices.map((v) => (
                <option key={v.voiceURI} value={v.voiceURI}>
                  {v.name} ({v.lang})
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label>Скорость ({settings.ttsRate.toFixed(2)})</Label>
            <input
              type="range"
              min={0.7}
              max={1.2}
              step={0.05}
              value={settings.ttsRate}
              onChange={(e) => updateSettings({ ttsRate: Number(e.target.value) })}
              className="w-full"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>SRS · порог освоения</CardTitle>
          <CardDescription>
            Карточка «освоена» после N успешных повторов подряд с интервалом ≥ порога.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-3">
          <NumberField
            label="Успехов подряд"
            value={settings.masteryConsecutiveRequired}
            onChange={(v) => updateSettings({ masteryConsecutiveRequired: v })}
          />
          <NumberField
            label="Мин. интервал (дни)"
            value={settings.masteryMinIntervalDays}
            onChange={(v) => updateSettings({ masteryMinIntervalDays: v })}
          />
          <NumberField
            label="Контроль (дни)"
            value={settings.masteryRecheckDays}
            onChange={(v) => updateSettings({ masteryRecheckDays: v })}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Данные</CardTitle>
          <CardDescription>Экспорт / импорт JSON. API-ключ в файл не попадает.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button
            variant="secondary"
            onClick={() =>
              downloadJson(
                `english-learner-backup-${new Date().toISOString().slice(0, 10)}.json`,
                exportData(),
              )
            }
          >
            Экспорт
          </Button>
          <label className="inline-flex">
            <Button variant="secondary" asChild>
              <span>Импорт</span>
            </Button>
            <input
              type="file"
              accept="application/json,.json"
              className="hidden"
              onChange={async (e) => {
                const file = e.target.files?.[0]
                if (!file) return
                const text = await file.text()
                importData(JSON.parse(text))
                e.target.value = ''
              }}
            />
          </label>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Сброс прогресса</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {(
            [
              ['cards', 'Слова'],
              ['tenses', 'Времена'],
              ['transcription', 'Транскрипция'],
              ['translation', 'Переводы'],
              ['ipa', 'IPA'],
              ['all', 'Всё'],
            ] as const
          ).map(([id, label]) => (
            <Button
              key={id}
              variant="outline"
              size="sm"
              onClick={() => {
                if (confirm(`Сбросить: ${label}?`)) reset(id)
              }}
            >
              {label}
            </Button>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}

function NumberField({
  label,
  value,
  onChange,
}: {
  label: string
  value: number
  onChange: (v: number) => void
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <Input
        type="number"
        min={1}
        value={value}
        onChange={(e) => onChange(Math.max(1, Number(e.target.value) || 1))}
      />
    </div>
  )
}

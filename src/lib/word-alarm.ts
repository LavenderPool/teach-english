import {
  isPermissionGranted,
  onAction,
  registerActionTypes,
  requestPermission,
  sendNotification,
} from '@tauri-apps/plugin-notification'
import type { Card } from '@/lib/types'
import { isTauri } from '@/lib/tauri'
import { openMiniWindow } from '@/lib/mini-window'
import { useAppStore } from '@/stores/app-store'

const ACTION_TYPE = 'word-reminder'
const CHECK_EVERY_MS = 30_000
const SHORT_WORD_MAX = 8

let started = false
let timer: ReturnType<typeof setInterval> | null = null
let actionUnlisten: { unregister: () => Promise<void> } | null = null

function pickShortWords(cards: Card[], count: number): Card[] {
  if (cards.length === 0) return []
  const short = cards.filter((c) => c.word.trim().split(/\s+/).length === 1 && c.word.length <= SHORT_WORD_MAX)
  const pool = short.length >= count ? short : cards
  const shuffled = [...pool].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, Math.min(count, shuffled.length))
}

async function ensurePermission(): Promise<boolean> {
  let granted = await isPermissionGranted()
  if (!granted) {
    const permission = await requestPermission()
    granted = permission === 'granted'
  }
  return granted
}

async function setupActions(): Promise<void> {
  try {
    await registerActionTypes([
      {
        id: ACTION_TYPE,
        actions: [
          {
            id: 'open-mini',
            title: 'Открыть перевод',
            foreground: true,
          },
        ],
      },
    ])
  } catch {
    /* actions are best-effort on desktop */
  }

  if (actionUnlisten) return
  try {
    actionUnlisten = await onAction((notification) => {
      const cardId =
        typeof notification.extra?.cardId === 'string' ? notification.extra.cardId : undefined
      void openMiniWindow(cardId)
    })
  } catch {
    /* click callbacks are limited on some macOS plugin backends */
  }
}

async function fireAlarm(): Promise<void> {
  const state = useAppStore.getState()
  const { settings, cards } = state
  if (!settings.wordAlarmEnabled) return
  if (settings.wordAlarmPendingUnlock) return

  const picks = pickShortWords(cards, 3)
  if (picks.length === 0) {
    state.updateSettings({
      wordAlarmNextAt: Date.now() + settings.wordAlarmIntervalHours * 60 * 60 * 1000,
    })
    return
  }

  const primary = picks[0]
  const others = picks.slice(1).map((c) => c.word)

  const granted = await ensurePermission()
  if (granted) {
    sendNotification({
      title: primary.word,
      body:
        others.length > 0
          ? `${others.join(' · ')} — нажмите, чтобы открыть перевод`
          : 'Нажмите, чтобы открыть перевод',
      actionTypeId: ACTION_TYPE,
      extra: { cardId: primary.id, kind: 'word-alarm' },
    })
  }

  state.updateSettings({
    wordAlarmPendingUnlock: true,
    wordAlarmCardsProgress: 0,
    wordAlarmLastWordId: primary.id,
    wordAlarmNextAt: null,
  })

  await openMiniWindow(primary.id)
}

function tick(): void {
  if (!isTauri()) return
  const { settings } = useAppStore.getState()
  if (!settings.wordAlarmEnabled) return
  if (settings.wordAlarmPendingUnlock) return
  const nextAt = settings.wordAlarmNextAt
  if (nextAt == null) {
    useAppStore.getState().updateSettings({
      wordAlarmNextAt: Date.now() + settings.wordAlarmIntervalHours * 60 * 60 * 1000,
    })
    return
  }
  if (Date.now() >= nextAt) {
    void fireAlarm()
  }
}

export function armWordAlarmFromNow(): void {
  const { settings, updateSettings } = useAppStore.getState()
  updateSettings({
    wordAlarmPendingUnlock: false,
    wordAlarmCardsProgress: 0,
    wordAlarmNextAt: Date.now() + settings.wordAlarmIntervalHours * 60 * 60 * 1000,
  })
}

export async function startWordAlarmService(): Promise<void> {
  if (!isTauri() || started) return
  started = true
  await setupActions()
  tick()
  timer = setInterval(tick, CHECK_EVERY_MS)
}

export function stopWordAlarmService(): void {
  if (timer) clearInterval(timer)
  timer = null
  started = false
  void actionUnlisten?.unregister()
  actionUnlisten = null
}

/** Manual test / settings preview. */
export async function triggerWordAlarmNow(): Promise<void> {
  if (!isTauri()) return
  await setupActions()
  useAppStore.getState().updateSettings({
    wordAlarmPendingUnlock: false,
    wordAlarmNextAt: Date.now() - 1,
  })
  await fireAlarm()
}

import { create } from 'zustand'
import { TENSES } from '@/data/tenses'
import { SEED_WORDS } from '@/data/seed-words'
import { applyReview, createCard, dueCards } from '@/lib/srs'
import { exportDatabase, importDatabase, loadDatabase, resetSection, saveDatabase } from '@/lib/storage'
import type {
  AppDatabase,
  AppSettings,
  Card,
  ChatMessage,
  IpaProgress,
  ReviewQuality,
  ThemeMode,
  TranscriptionAttempt,
  TranslationExercise,
  TenseProgress,
} from '@/lib/types'
import { now } from '@/lib/utils'
import { toast } from '@/stores/toast-store'

function ensureTenseProgress(db: AppDatabase): TenseProgress[] {
  const map = new Map(db.tensesProgress.map((t) => [t.tenseId, t]))
  return TENSES.map(
    (t) =>
      map.get(t.id) ?? {
        tenseId: t.id,
        theoryRead: false,
        practiceScore: 0,
        attempts: 0,
      },
  )
}

function persist(db: AppDatabase) {
  saveDatabase(db)
  return db
}

function applyTheme(theme: ThemeMode) {
  const root = document.documentElement
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  const dark = theme === 'dark' || (theme === 'system' && prefersDark)
  root.classList.toggle('dark', dark)
}

function updateStreak(settings: AppSettings): AppSettings {
  const today = new Date().toISOString().slice(0, 10)
  if (settings.lastStudyDate === today) return settings
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const y = yesterday.toISOString().slice(0, 10)
  const streak =
    settings.lastStudyDate === y ? settings.streakDays + 1 : settings.lastStudyDate ? 1 : 1
  return { ...settings, streakDays: streak, lastStudyDate: today }
}

interface AppState extends AppDatabase {
  hydrated: boolean
  hydrate: () => void
  setTheme: (theme: ThemeMode) => void
  updateSettings: (patch: Partial<AppSettings>) => void
  markStudied: () => void

  // Cards
  addCard: (partial: Pick<Card, 'word' | 'translation'> & Partial<Card>) => Card
  updateCard: (id: string, patch: Partial<Card>) => void
  removeCard: (id: string) => void
  reviewCard: (id: string, quality: ReviewQuality) => void
  importSeedDictionary: () => number
  dueToday: () => Card[]

  // Tenses
  markTheoryRead: (tenseId: string) => void
  recordTensePractice: (tenseId: string, correct: boolean) => void
  addChatMessage: (tenseId: string, role: 'user' | 'assistant', content: string) => void
  clearChat: (tenseId: string) => void
  chatFor: (tenseId: string) => ChatMessage[]
  progressFor: (tenseId: string) => TenseProgress

  // Transcription
  addTranscriptionAttempt: (attempt: Omit<TranscriptionAttempt, 'id' | 'createdAt'>) => void
  setIpaLearned: (symbol: string, learned: boolean) => void
  isIpaLearned: (symbol: string) => boolean

  // Translation
  addTranslationExercise: (ex: Omit<TranslationExercise, 'id' | 'createdAt'>) => void

  // Arcade
  rememberArcadeWord: (word: string) => void

  // Data mgmt
  exportData: () => AppDatabase
  importData: (data: unknown) => void
  reset: (section: 'cards' | 'tenses' | 'transcription' | 'translation' | 'ipa' | 'all') => void
}

export const useAppStore = create<AppState>((set, get) => ({
  ...loadDatabase(),
  tensesProgress: ensureTenseProgress(loadDatabase()),
  hydrated: false,

  hydrate: () => {
    const db = loadDatabase()
    db.tensesProgress = ensureTenseProgress(db)
    applyTheme(db.settings.theme)
    set({ ...db, hydrated: true })
  },

  setTheme: (theme) => {
    applyTheme(theme)
    set((s) => persist({ ...s, settings: { ...s.settings, theme } }))
  },

  updateSettings: (patch) => {
    set((s) => {
      const settings = { ...s.settings, ...patch }
      if (patch.theme) applyTheme(patch.theme)
      return persist({ ...s, settings })
    })
  },

  markStudied: () => {
    set((s) => persist({ ...s, settings: updateStreak(s.settings) }))
  },

  addCard: (partial) => {
    const card = createCard(partial)
    set((s) => persist({ ...s, cards: [card, ...s.cards], settings: updateStreak(s.settings) }))
    return card
  },

  updateCard: (id, patch) => {
    set((s) =>
      persist({
        ...s,
        cards: s.cards.map((c) => (c.id === id ? { ...c, ...patch } : c)),
      }),
    )
  },

  removeCard: (id) => {
    set((s) => persist({ ...s, cards: s.cards.filter((c) => c.id !== id) }))
  },

  reviewCard: (id, quality) => {
    const { settings } = get()
    set((s) =>
      persist({
        ...s,
        settings: updateStreak(s.settings),
        cards: s.cards.map((c) =>
          c.id === id
            ? applyReview(c, quality, {
                masteryConsecutiveRequired: settings.masteryConsecutiveRequired,
                masteryMinIntervalDays: settings.masteryMinIntervalDays,
                masteryRecheckDays: settings.masteryRecheckDays,
              })
            : c,
        ),
      }),
    )
  },

  importSeedDictionary: () => {
    const existing = new Set(get().cards.map((c) => c.word.toLowerCase()))
    const fresh = SEED_WORDS.filter((w) => !existing.has(w.word.toLowerCase())).map((w) =>
      createCard({
        word: w.word,
        translation: w.translation,
        transcription: w.transcription,
        category: w.category,
        exampleEn: w.exampleEn,
        exampleRu: w.exampleRu,
        source: 'imported',
      }),
    )
    set((s) => persist({ ...s, cards: [...fresh, ...s.cards] }))
    return fresh.length
  },

  dueToday: () => dueCards(get().cards),

  markTheoryRead: (tenseId) => {
    set((s) =>
      persist({
        ...s,
        tensesProgress: ensureTenseProgress(s).map((t) =>
          t.tenseId === tenseId ? { ...t, theoryRead: true } : t,
        ),
      }),
    )
  },

  recordTensePractice: (tenseId, correct) => {
    set((s) => {
      const progress = ensureTenseProgress(s).map((t) => {
        if (t.tenseId !== tenseId) return t
        const attempts = t.attempts + 1
        const practiceScore =
          attempts === 1
            ? correct
              ? 100
              : 0
            : (t.practiceScore * t.attempts + (correct ? 100 : 0)) / attempts
        return {
          ...t,
          attempts,
          practiceScore,
          lastPracticedAt: now(),
        }
      })
      return persist({ ...s, tensesProgress: progress, settings: updateStreak(s.settings) })
    })
  },

  addChatMessage: (tenseId, role, content) => {
    const msg: ChatMessage = {
      id: crypto.randomUUID(),
      tenseId,
      role,
      content,
      createdAt: now(),
    }
    set((s) => persist({ ...s, tenseChatHistory: [...s.tenseChatHistory, msg] }))
  },

  clearChat: (tenseId) => {
    set((s) =>
      persist({
        ...s,
        tenseChatHistory: s.tenseChatHistory.filter((m) => m.tenseId !== tenseId),
      }),
    )
  },

  chatFor: (tenseId) => get().tenseChatHistory.filter((m) => m.tenseId === tenseId),

  progressFor: (tenseId) =>
    ensureTenseProgress(get()).find((t) => t.tenseId === tenseId) ?? {
      tenseId,
      theoryRead: false,
      practiceScore: 0,
      attempts: 0,
    },

  addTranscriptionAttempt: (attempt) => {
    const row: TranscriptionAttempt = {
      ...attempt,
      id: crypto.randomUUID(),
      createdAt: now(),
    }
    set((s) =>
      persist({
        ...s,
        transcriptionAttempts: [row, ...s.transcriptionAttempts],
        settings: updateStreak(s.settings),
      }),
    )
  },

  setIpaLearned: (symbol, learned) => {
    set((s) => {
      const exists = s.ipaProgress.find((p) => p.symbol === symbol)
      const ipaProgress: IpaProgress[] = exists
        ? s.ipaProgress.map((p) => (p.symbol === symbol ? { ...p, learned } : p))
        : [...s.ipaProgress, { symbol, learned }]
      return persist({ ...s, ipaProgress })
    })
  },

  isIpaLearned: (symbol) => !!get().ipaProgress.find((p) => p.symbol === symbol)?.learned,

  addTranslationExercise: (ex) => {
    const row: TranslationExercise = {
      ...ex,
      id: crypto.randomUUID(),
      createdAt: now(),
    }
    set((s) =>
      persist({
        ...s,
        translationExercises: [row, ...s.translationExercises],
        settings: updateStreak(s.settings),
      }),
    )
  },

  rememberArcadeWord: (word) => {
    set((s) => {
      const next = [...s.arcadeSeenWords, word.toLowerCase()].slice(-500)
      return persist({ ...s, arcadeSeenWords: next })
    })
  },

  exportData: () => exportDatabase(get()),

  importData: (data) => {
    try {
      const db = importDatabase(data)
      db.tensesProgress = ensureTenseProgress(db)
      applyTheme(db.settings.theme)
      set(persist({ ...db, hydrated: true } as AppState))
      toast('База данных импортирована', { kind: 'success' })
    } catch (e) {
      toast('Ошибка импорта', {
        kind: 'error',
        description: e instanceof Error ? e.message : 'Неизвестная ошибка',
      })
    }
  },

  reset: (section) => {
    set((s) => {
      const db = resetSection(s, section)
      db.tensesProgress = ensureTenseProgress(db)
      return persist({ ...db, hydrated: true } as AppState)
    })
    toast('Прогресс сброшен', { kind: 'info' })
  },
}))

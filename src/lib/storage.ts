import type { AppDatabase, AppSettings } from './types'
import { DB_VERSION, DEFAULT_SETTINGS } from './types'

const DB_KEY = 'english-learner-db'
const API_KEY_STORAGE = 'english-learner-api-key'

function emptyDb(settings: AppSettings = DEFAULT_SETTINGS): AppDatabase {
  return {
    version: DB_VERSION,
    cards: [],
    tensesProgress: [],
    tenseChatHistory: [],
    transcriptionAttempts: [],
    translationExercises: [],
    ipaProgress: [],
    settings,
    arcadeSeenWords: [],
  }
}

export function loadDatabase(): AppDatabase {
  try {
    const raw = localStorage.getItem(DB_KEY)
    if (!raw) return emptyDb()
    const parsed = JSON.parse(raw) as AppDatabase
    const apiKey =
      localStorage.getItem(API_KEY_STORAGE) ??
      parsed.settings?.deepseekApiKey ??
      ''
    return {
      ...emptyDb(),
      ...parsed,
      settings: {
        ...DEFAULT_SETTINGS,
        ...parsed.settings,
        deepseekApiKey: apiKey,
      },
    }
  } catch {
    return emptyDb()
  }
}

export function saveDatabase(db: AppDatabase): void {
  const { deepseekApiKey, ...restSettings } = db.settings
  if (deepseekApiKey) {
    localStorage.setItem(API_KEY_STORAGE, deepseekApiKey)
  } else {
    localStorage.removeItem(API_KEY_STORAGE)
  }
  const toStore: AppDatabase = {
    ...db,
    settings: { ...restSettings, deepseekApiKey: '' },
  }
  localStorage.setItem(DB_KEY, JSON.stringify(toStore))
}

export function exportDatabase(db: AppDatabase): AppDatabase {
  return {
    ...db,
    settings: { ...db.settings, deepseekApiKey: '' },
  }
}

export function importDatabase(data: unknown): AppDatabase {
  const parsed = data as AppDatabase
  if (!parsed || typeof parsed !== 'object' || !Array.isArray(parsed.cards)) {
    throw new Error('Неверный формат файла базы данных')
  }
  const currentKey = localStorage.getItem(API_KEY_STORAGE) ?? ''
  return {
    ...emptyDb(),
    ...parsed,
    version: DB_VERSION,
    settings: {
      ...DEFAULT_SETTINGS,
      ...parsed.settings,
      deepseekApiKey: currentKey,
    },
  }
}

export function resetSection(
  db: AppDatabase,
  section: 'cards' | 'tenses' | 'transcription' | 'translation' | 'ipa' | 'all',
): AppDatabase {
  const next = { ...db }
  if (section === 'cards' || section === 'all') {
    next.cards = []
    next.arcadeSeenWords = []
  }
  if (section === 'tenses' || section === 'all') {
    next.tensesProgress = []
    next.tenseChatHistory = []
  }
  if (section === 'transcription' || section === 'all') {
    next.transcriptionAttempts = []
  }
  if (section === 'translation' || section === 'all') {
    next.translationExercises = []
  }
  if (section === 'ipa' || section === 'all') {
    next.ipaProgress = []
  }
  if (section === 'all') {
    next.settings = {
      ...DEFAULT_SETTINGS,
      deepseekApiKey: db.settings.deepseekApiKey,
      theme: db.settings.theme,
    }
  }
  return next
}

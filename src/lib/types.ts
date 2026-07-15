export type ThemeMode = 'light' | 'dark' | 'system'
export type CefrLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1'
export type CardSource = 'manual' | 'arcade_mistake' | 'imported' | 'transcription_mistake'
export type ReviewQuality = 'again' | 'hard' | 'good' | 'easy'
export type TranslationDirection = 'ru_to_en' | 'en_to_ru'
export type TextLength = 'sentence' | 'paragraph'

export interface Card {
  id: string
  word: string
  translation: string
  transcription?: string
  exampleEn?: string
  exampleRu?: string
  category?: string
  source: CardSource
  createdAt: number
  easeFactor: number
  intervalDays: number
  repetitions: number
  nextReviewAt: number
  lastReviewedAt?: number
  lapses: number
  consecutiveLongSuccesses: number
  mastered: boolean
}

export interface TenseProgress {
  tenseId: string
  theoryRead: boolean
  practiceScore: number
  attempts: number
  lastPracticedAt?: number
}

export interface ChatMessage {
  id: string
  tenseId: string
  role: 'user' | 'assistant'
  content: string
  createdAt: number
}

export interface TranscriptionAttempt {
  id: string
  audioWord: string
  correctTranscription: string
  userAnswer: string
  isCorrect: boolean
  createdAt: number
}

export interface TranslationExercise {
  id: string
  direction: TranslationDirection
  tensesUsed: string[]
  sourceText: string
  idealTranslation: string
  userTranslation: string
  matchPercentage: number
  aiFeedback: string
  grammarErrors: string[]
  createdAt: number
}

export interface IpaProgress {
  symbol: string
  learned: boolean
}

export interface AppSettings {
  theme: ThemeMode
  deepseekApiKey: string
  ttsVoice: string
  ttsRate: number
  masteryConsecutiveRequired: number
  masteryMinIntervalDays: number
  masteryRecheckDays: number
  arcadeLevel: CefrLevel
  arcadeTopic: string
  arcadeTimerSec: number
  streakDays: number
  lastStudyDate: string | null
  /** macOS: word reminder alarm */
  wordAlarmEnabled: boolean
  /** Fire every N hours */
  wordAlarmIntervalHours: number
  /** Cards to complete after an alarm before it arms again */
  wordAlarmCardsRequired: number
  /** Timestamp of next fire; null while waiting for unlock cards */
  wordAlarmNextAt: number | null
  /** After alarm fired — waiting for card completions */
  wordAlarmPendingUnlock: boolean
  wordAlarmCardsProgress: number
  wordAlarmLastWordId: string | null
}

export interface AppDatabase {
  version: number
  cards: Card[]
  tensesProgress: TenseProgress[]
  tenseChatHistory: ChatMessage[]
  transcriptionAttempts: TranscriptionAttempt[]
  translationExercises: TranslationExercise[]
  ipaProgress: IpaProgress[]
  settings: AppSettings
  arcadeSeenWords: string[]
}

export const DEFAULT_SETTINGS: AppSettings = {
  theme: 'system',
  deepseekApiKey: '',
  ttsVoice: '',
  ttsRate: 0.95,
  masteryConsecutiveRequired: 3,
  masteryMinIntervalDays: 21,
  masteryRecheckDays: 75,
  arcadeLevel: 'B1',
  arcadeTopic: '',
  arcadeTimerSec: 0,
  streakDays: 0,
  lastStudyDate: null,
  wordAlarmEnabled: false,
  wordAlarmIntervalHours: 3,
  wordAlarmCardsRequired: 5,
  wordAlarmNextAt: null,
  wordAlarmPendingUnlock: false,
  wordAlarmCardsProgress: 0,
  wordAlarmLastWordId: null,
}

export const DB_VERSION = 1

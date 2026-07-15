import type { Card, ReviewQuality } from './types'
import { now } from './utils'

const QUALITY_MAP: Record<ReviewQuality, number> = {
  again: 0,
  hard: 3,
  good: 4,
  easy: 5,
}

export function createCard(
  partial: Pick<Card, 'word' | 'translation'> & Partial<Card>,
): Card {
  const timestamp = now()
  return {
    id: crypto.randomUUID(),
    transcription: '',
    exampleEn: '',
    exampleRu: '',
    category: 'General',
    source: 'manual',
    createdAt: timestamp,
    easeFactor: 2.5,
    intervalDays: 0,
    repetitions: 0,
    nextReviewAt: timestamp,
    lapses: 0,
    consecutiveLongSuccesses: 0,
    mastered: false,
    ...partial,
  }
}

/**
 * Modified SM-2 with mastery tracking:
 * mastered only after N consecutive successful reviews with interval >= threshold.
 * Mastered cards resurface for control review every recheckDays.
 */
export function applyReview(
  card: Card,
  quality: ReviewQuality,
  options: { masteryConsecutiveRequired: number; masteryMinIntervalDays: number; masteryRecheckDays: number },
): Card {
  const q = QUALITY_MAP[quality]
  let { easeFactor, intervalDays, repetitions, lapses, consecutiveLongSuccesses, mastered } = card
  const timestamp = now()

  if (quality === 'again') {
    repetitions = 0
    intervalDays = 1
    lapses += 1
    easeFactor = Math.max(1.3, easeFactor - 0.2)
    consecutiveLongSuccesses = 0
    mastered = false
  } else {
    repetitions += 1
    if (repetitions === 1) intervalDays = 1
    else if (repetitions === 2) intervalDays = 6
    else intervalDays = Math.max(1, Math.round(intervalDays * easeFactor))

    if (quality === 'hard') intervalDays = Math.max(1, Math.round(intervalDays * 0.8))
    if (quality === 'easy') intervalDays = Math.max(1, Math.round(intervalDays * 1.3))

    easeFactor = Math.max(
      1.3,
      easeFactor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02)),
    )

    if (intervalDays >= options.masteryMinIntervalDays && quality !== 'hard') {
      consecutiveLongSuccesses += 1
    } else if (quality === 'hard') {
      consecutiveLongSuccesses = Math.max(0, consecutiveLongSuccesses - 1)
    }

    if (consecutiveLongSuccesses >= options.masteryConsecutiveRequired) {
      mastered = true
      intervalDays = options.masteryRecheckDays
    }
  }

  return {
    ...card,
    easeFactor,
    intervalDays,
    repetitions,
    lapses,
    consecutiveLongSuccesses,
    mastered,
    lastReviewedAt: timestamp,
    nextReviewAt: timestamp + intervalDays * 86_400_000,
  }
}

export function dueCards(cards: Card[], at = now()): Card[] {
  return cards
    .filter((c) => !c.mastered || c.nextReviewAt <= at)
    .filter((c) => c.nextReviewAt <= at)
    .sort((a, b) => a.nextReviewAt - b.nextReviewAt)
}

export function todayDueCount(cards: Card[]): number {
  return dueCards(cards).length
}

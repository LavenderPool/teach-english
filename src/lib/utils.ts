import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function now(): number {
  return Date.now()
}

export function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function formatPercent(value: number): string {
  return `${Math.round(value)}%`
}

export function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n))
}

/** Normalize IPA for fuzzy compare */
export function normalizeIpa(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .replace(/[[\]]/g, '')
    .replace(/\//g, '')
    .replace(/\s+/g, '')
    .replace(/ː/g, ':')
    .replace(/ˈ|ˌ/g, '')
}

export function levenshtein(a: string, b: string): number {
  const m = a.length
  const n = b.length
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0))
  for (let i = 0; i <= m; i++) dp[i][0] = i
  for (let j = 0; j <= n; j++) dp[0][j] = j
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost)
    }
  }
  return dp[m][n]
}

export function ipaMatch(user: string, correct: string, threshold = 0.8): boolean {
  const a = normalizeIpa(user)
  const b = normalizeIpa(correct)
  if (!a || !b) return false
  if (a === b) return true
  const dist = levenshtein(a, b)
  const maxLen = Math.max(a.length, b.length)
  return 1 - dist / maxLen >= threshold
}

export function downloadJson(filename: string, data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

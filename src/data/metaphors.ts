export interface MetaphorPhrase {
  phrase: string
  translation: string
  category: string
  level: string
  note?: string
}

/** Lazy-load ~500 English idioms, metaphors and set phrases */
export async function loadMetaphors(): Promise<MetaphorPhrase[]> {
  const mod = await import('./metaphors.json')
  return mod.default as MetaphorPhrase[]
}

export interface SeedWord {
  word: string
  translation: string
  transcription: string
  category: string
  level: string
  exampleEn?: string
  exampleRu?: string
}

/** Lazy-load ~5500 high-frequency English words with Russian translations */
export async function loadSeedWords(): Promise<SeedWord[]> {
  const mod = await import('./seed-words.json')
  return mod.default as SeedWord[]
}

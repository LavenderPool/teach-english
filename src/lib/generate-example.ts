import { deepseekJson } from '@/lib/deepseek'

/** Generate a bilingual example sentence for a vocabulary card in the background. */
export async function generateCardExample(options: {
  apiKey: string
  word: string
  translation: string
  signal?: AbortSignal
}): Promise<{ exampleEn: string; exampleRu: string }> {
  return deepseekJson<{ exampleEn: string; exampleRu: string }>({
    apiKey: options.apiKey,
    temperature: 0.7,
    maxTokens: 200,
    signal: options.signal,
    messages: [
      {
        role: 'system',
        content:
          'Сгенерируй один короткий естественный пример на английском с данным словом и перевод на русский. Верни JSON: {"exampleEn":"...","exampleRu":"..."}',
      },
      {
        role: 'user',
        content: `Слово: ${options.word}\nПеревод: ${options.translation}`,
      },
    ],
  })
}

export class DeepSeekError extends Error {
  code?: 'auth' | 'rate' | 'timeout' | 'parse' | 'network' | 'unknown'

  constructor(
    message: string,
    code?: 'auth' | 'rate' | 'timeout' | 'parse' | 'network' | 'unknown',
  ) {
    super(message)
    this.name = 'DeepSeekError'
    this.code = code
  }
}

export interface ChatMessageInput {
  role: 'system' | 'user' | 'assistant'
  content: string
}

interface ChatOptions {
  apiKey: string
  messages: ChatMessageInput[]
  model?: 'deepseek-chat' | 'deepseek-reasoner'
  temperature?: number
  maxTokens?: number
  json?: boolean
  signal?: AbortSignal
}

const ENDPOINT = 'https://api.deepseek.com/v1/chat/completions'

export async function deepseekChat(options: ChatOptions): Promise<string> {
  const {
    apiKey,
    messages,
    model = 'deepseek-chat',
    temperature = 0.7,
    maxTokens = 1200,
    json = false,
    signal,
  } = options

  if (!apiKey?.trim()) {
    throw new DeepSeekError(
      'Добавьте API-ключ DeepSeek в настройках, чтобы использовать ИИ-функции',
      'auth',
    )
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 45_000)
  const onAbort = () => controller.abort()
  signal?.addEventListener('abort', onAbort)

  try {
    const response = await fetch(ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages,
        temperature,
        max_tokens: maxTokens,
        ...(json ? { response_format: { type: 'json_object' } } : {}),
      }),
      signal: controller.signal,
    })

    if (response.status === 401) {
      throw new DeepSeekError('Проверьте API-ключ DeepSeek в настройках', 'auth')
    }
    if (response.status === 429) {
      throw new DeepSeekError('Превышен лимит запросов DeepSeek. Попробуйте позже.', 'rate')
    }
    if (!response.ok) {
      const text = await response.text().catch(() => '')
      throw new DeepSeekError(`Ошибка DeepSeek (${response.status}): ${text || response.statusText}`, 'unknown')
    }

    const data = (await response.json()) as {
      choices?: { message?: { content?: string } }[]
    }
    const content = data.choices?.[0]?.message?.content
    if (!content) throw new DeepSeekError('Пустой ответ от DeepSeek', 'parse')
    return content
  } catch (err) {
    if (err instanceof DeepSeekError) throw err
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new DeepSeekError('Превышено время ожидания ответа DeepSeek', 'timeout')
    }
    throw new DeepSeekError('Не удалось связаться с DeepSeek. Проверьте интернет.', 'network')
  } finally {
    clearTimeout(timeout)
    signal?.removeEventListener('abort', onAbort)
  }
}

export async function deepseekJson<T>(options: ChatOptions): Promise<T> {
  const content = await deepseekChat({ ...options, json: true })
  try {
    const cleaned = content.replace(/^```json\s*/i, '').replace(/```$/i, '').trim()
    return JSON.parse(cleaned) as T
  } catch {
    throw new DeepSeekError('Не удалось разобрать JSON-ответ от ИИ', 'parse')
  }
}

export async function validateApiKey(apiKey: string): Promise<boolean> {
  const content = await deepseekChat({
    apiKey,
    messages: [
      { role: 'system', content: 'Reply with exactly: ok' },
      { role: 'user', content: 'ping' },
    ],
    maxTokens: 10,
    temperature: 0,
  })
  return content.toLowerCase().includes('ok')
}

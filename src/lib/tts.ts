let cachedVoices: SpeechSynthesisVoice[] = []

export function getVoices(): SpeechSynthesisVoice[] {
  if (typeof window === 'undefined' || !window.speechSynthesis) return []
  const voices = window.speechSynthesis.getVoices()
  if (voices.length) cachedVoices = voices
  return cachedVoices.length ? cachedVoices : voices
}

export function englishVoices(): SpeechSynthesisVoice[] {
  return getVoices().filter((v) => v.lang.toLowerCase().startsWith('en'))
}

export function speak(
  text: string,
  options: { voiceURI?: string; rate?: number; lang?: string } = {},
): void {
  if (typeof window === 'undefined' || !window.speechSynthesis) return
  window.speechSynthesis.cancel()
  const utter = new SpeechSynthesisUtterance(text)
  utter.lang = options.lang ?? 'en-US'
  utter.rate = options.rate ?? 0.95
  const voices = getVoices()
  const preferred =
    (options.voiceURI && voices.find((v) => v.voiceURI === options.voiceURI)) ||
    englishVoices()[0]
  if (preferred) utter.voice = preferred
  window.speechSynthesis.speak(utter)
}

export function stopSpeaking(): void {
  if (typeof window === 'undefined' || !window.speechSynthesis) return
  window.speechSynthesis.cancel()
}

// Warm up voices list (Chrome loads async)
if (typeof window !== 'undefined' && window.speechSynthesis) {
  window.speechSynthesis.onvoiceschanged = () => {
    cachedVoices = window.speechSynthesis.getVoices()
  }
}

import { isTauri } from '@/lib/tauri'

const MINI_LABEL = 'mini'
const MINI_URL = '/mini'

/** Open or focus the compact study window (Tauri only). */
export async function openMiniWindow(cardId?: string): Promise<void> {
  if (!isTauri()) {
    const qs = cardId ? `?card=${encodeURIComponent(cardId)}` : ''
    window.open(`${MINI_URL}${qs}`, 'english-learner-mini', 'width=400,height=560')
    return
  }

  const { WebviewWindow } = await import('@tauri-apps/api/webviewWindow')
  const existing = await WebviewWindow.getByLabel(MINI_LABEL)
  const url = cardId ? `${MINI_URL}?card=${encodeURIComponent(cardId)}` : MINI_URL

  if (existing) {
    try {
      await existing.show()
      await existing.setFocus()
      await existing.emit('mini-focus-card', { cardId: cardId ?? null })
    } catch {
      /* window may already be focused */
    }
    return
  }

  const mini = new WebviewWindow(MINI_LABEL, {
    url,
    title: 'English Learner · Слово',
    width: 400,
    height: 560,
    minWidth: 340,
    minHeight: 420,
    resizable: true,
    focus: true,
    visible: true,
    alwaysOnTop: true,
    decorations: true,
  })

  mini.once('tauri://error', (e) => {
    console.error('Failed to create mini window', e)
  })
}

/** Focus the main app window and optionally navigate. */
export async function openMainWindow(path = '/words'): Promise<void> {
  if (!isTauri()) {
    window.location.assign(path)
    return
  }

  const { WebviewWindow } = await import('@tauri-apps/api/webviewWindow')
  const main = await WebviewWindow.getByLabel('main')
  if (main) {
    await main.show()
    await main.setFocus()
    await main.emit('navigate', { path })
  }

  const current = WebviewWindow.getCurrent()
  if (current.label === MINI_LABEL) {
    try {
      await current.close()
    } catch {
      /* ignore */
    }
  }
}

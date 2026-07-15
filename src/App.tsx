import { useEffect } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import { CommandPalette } from '@/components/CommandPalette'
import { DashboardPage } from '@/features/dashboard/DashboardPage'
import { GenerationPage } from '@/features/generation/GenerationPage'
import { SettingsPage } from '@/features/settings/SettingsPage'
import { TenseDetailPage, TensesListPage } from '@/features/tenses/TensesPage'
import { TranscriptionPage } from '@/features/transcription/TranscriptionPage'
import { ArcadePage, WordsPage } from '@/features/words/WordsPage'
import { MiniStudyPage } from '@/features/words/MiniStudyPage'
import { isTauri } from '@/lib/tauri'
import { startWordAlarmService } from '@/lib/word-alarm'
import { useAppStore } from '@/stores/app-store'

export default function App() {
  const hydrate = useAppStore((s) => s.hydrate)
  const hydrated = useAppStore((s) => s.hydrated)
  const theme = useAppStore((s) => s.settings.theme)

  useEffect(() => {
    hydrate()
  }, [hydrate])

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const apply = () => {
      const dark = theme === 'dark' || (theme === 'system' && mq.matches)
      document.documentElement.classList.toggle('dark', dark)
    }
    apply()
    mq.addEventListener('change', apply)
    return () => mq.removeEventListener('change', apply)
  }, [theme])

  useEffect(() => {
    if (!hydrated || !isTauri()) return
    void startWordAlarmService()
  }, [hydrated])

  useEffect(() => {
    if (!hydrated || !isTauri()) return
    let disposed = false
    let unlisten: (() => void) | undefined
    void import('@tauri-apps/api/event').then(({ listen }) => {
      if (disposed) return
      void listen<{ path: string }>('navigate', (event) => {
        const path = event.payload?.path
        if (path) window.location.assign(path)
      }).then((fn) => {
        if (disposed) {
          fn()
          return
        }
        unlisten = fn
      })
    })
    return () => {
      disposed = true
      unlisten?.()
    }
  }, [hydrated])

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/mini" element={<MiniStudyPage />} />
        <Route element={<AppShell />}>
          <Route index element={<DashboardPage />} />
          <Route path="transcription" element={<TranscriptionPage />} />
          <Route path="tenses" element={<TensesListPage />} />
          <Route path="tenses/:tenseId" element={<TenseDetailPage />} />
          <Route path="words" element={<WordsPage />} />
          <Route path="words/arcade" element={<ArcadePage />} />
          <Route path="generation" element={<GenerationPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
      {!window.location.pathname.startsWith('/mini') && <CommandPalette />}
    </BrowserRouter>
  )
}

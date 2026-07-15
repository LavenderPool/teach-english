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
import { useAppStore } from '@/stores/app-store'

export default function App() {
  const hydrate = useAppStore((s) => s.hydrate)
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

  return (
    <BrowserRouter>
      <Routes>
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
      <CommandPalette />
    </BrowserRouter>
  )
}

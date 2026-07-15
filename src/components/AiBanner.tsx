import { Link } from 'react-router-dom'
import { AlertTriangle } from 'lucide-react'
import { useAppStore } from '@/stores/app-store'

export function AiBanner() {
  const apiKey = useAppStore((s) => s.settings.deepseekApiKey)
  if (apiKey.trim()) return null

  return (
    <div className="mb-5 flex items-start gap-3 rounded-2xl border border-warning/30 bg-warning/10 px-4 py-3 text-sm">
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
      <div>
        <div className="font-medium">ИИ-функции недоступны</div>
        <div className="mt-0.5 text-muted-foreground">
          Добавьте API-ключ DeepSeek в{' '}
          <Link to="/settings" className="text-accent underline-offset-2 hover:underline">
            настройках
          </Link>
          , чтобы использовать генерацию, аркаду, чат и проверку переводов.
        </div>
      </div>
    </div>
  )
}

import { Link } from 'react-router-dom'
import { useAppStore } from '@/stores/app-store'

export function AiBanner() {
  const apiKey = useAppStore((s) => s.settings.deepseekApiKey)
  if (apiKey.trim()) return null

  return (
    <div className="mb-5 rounded-2xl border border-warning/25 bg-warning/10 px-4 py-3 text-[13px]">
      <div className="font-semibold">ИИ-функции недоступны</div>
      <div className="mt-0.5 text-muted-foreground">
        Добавьте API-ключ DeepSeek в{' '}
        <Link to="/settings" className="font-semibold text-accent underline-offset-2 hover:underline">
          настройках
        </Link>
        , чтобы использовать генерацию, аркаду, чат и проверку переводов.
      </div>
    </div>
  )
}

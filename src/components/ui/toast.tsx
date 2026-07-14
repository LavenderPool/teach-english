import { useToastStore } from '@/stores/toast-store'

export function Toaster() {
  const { toasts, dismiss } = useToastStore()
  return (
    <div className="pointer-events-none fixed bottom-5 right-5 z-50 flex w-[min(360px,calc(100vw-2rem))] flex-col gap-2">
      {toasts.map((t) => (
        <button
          key={t.id}
          type="button"
          onClick={() => dismiss(t.id)}
          className={`pointer-events-auto animate-toast-in rounded-2xl border border-border bg-card p-4 text-left shadow-lg transition-opacity ${
            t.kind === 'error'
              ? 'border-danger/30'
              : t.kind === 'success'
                ? 'border-success/30'
                : ''
          }`}
        >
          <div className="text-sm font-medium">{t.title}</div>
          {t.description && (
            <div className="mt-1 text-xs text-muted-foreground">{t.description}</div>
          )}
        </button>
      ))}
    </div>
  )
}

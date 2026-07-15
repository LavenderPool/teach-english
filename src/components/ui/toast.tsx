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
          className={`glass-strong pointer-events-auto animate-toast-in rounded-3xl p-4 text-left transition-opacity ${
            t.kind === 'error'
              ? 'border-danger/35'
              : t.kind === 'success'
                ? 'border-success/35'
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

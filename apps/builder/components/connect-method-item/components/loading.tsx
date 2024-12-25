import { cn } from '@/lib/utils'

export function ConnectMethodItemLoading() {
  return (
    <button
      className={cn(
        'flex items-center justify-between rounded-xl p-3 w-full animate-pulse',
        'bg-fg-secondary'
      )}
    >
      <span className="flex items-center gap-2 animation-pulse w-full">
        <div className="w-6 h-6 bg-neutral-400/30 rounded-md"></div>
        <span className="text-transparent w-2/3 h-4 bg-neutral-400/30 rounded-md"></span>
      </span>
    </button>
  )
}

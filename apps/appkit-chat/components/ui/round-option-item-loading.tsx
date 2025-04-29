import { cn } from '@/lib/utils'

export function RoundOptionItemLoading() {
  return (
    <div
      className={cn(
        'w-12 h-12 rounded-full animate-pulse',
        'flex items-center justify-center border border-neutral-300 dark:border-neutral-700'
      )}
    >
      <div className="w-8 h-8 bg-neutral-300 dark:bg-neutral-700 rounded-2xl"></div>
    </div>
  )
}

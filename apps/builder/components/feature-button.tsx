import { cn } from '@/lib/utils'
import { Checkbox } from '@/components/ui/checkbox'
import { DragIcon } from '@/components/icon/drag'

interface FeatureButtonProps {
  label: string
  isEnabled: boolean | undefined
  onClick: () => void
  dragHandle?: boolean
}

export function FeatureButton({
  dragHandle = false,
  label,
  isEnabled,
  onClick
}: FeatureButtonProps) {
  return (
    <button
      className={cn(
        'flex items-center justify-between rounded-xl p-3 w-full',
        isEnabled
          ? 'bg-foreground/5 dark:bg-foreground/5'
          : 'bg-foreground/[2%] dark:bg-foreground/[2%]'
      )}
      onClick={onClick}
    >
      <span className="flex items-center gap-2 text-foreground">
        {dragHandle ? <DragIcon /> : null}
        {label}
      </span>
      <Checkbox checked={isEnabled} />
    </button>
  )
}

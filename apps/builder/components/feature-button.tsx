import { cn } from '@/lib/utils'
import { Checkbox } from '@/components/ui/checkbox'
import { DragIcon } from '@/components/icon/drag'

interface FeatureButtonProps {
  label: string
  isEnabled: boolean | undefined
  onClick: () => void
}

export function FeatureButton({ label, isEnabled, onClick }: FeatureButtonProps) {
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
        <DragIcon />
        {label}
      </span>
      <Checkbox
        className="bg-transparent border border-muted-foreground/10 data-[state=checked]:bg-blue-500 data-[state=checked]:text-white data-[state=checked]:text-xl w-6 h-6 rounded-lg"
        checked={isEnabled}
      />
    </button>
  )
}

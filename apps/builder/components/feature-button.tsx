import dynamic from 'next/dynamic'

import { DragIcon } from '@/components/icon/drag'
import { cn } from '@/lib/utils'

const Checkbox = dynamic(() => import('@/components/ui/checkbox').then(mod => mod.Checkbox), {
  ssr: false
})

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
    <div
      className={cn(
        'flex items-center justify-between rounded-xl p-3 w-full h-[52px]',
        'bg-fg-secondary'
      )}
      onClick={onClick}
    >
      <span className="flex items-center gap-2 text-foreground">
        {dragHandle ? <DragIcon /> : null}
        {label}
      </span>
      <Checkbox checked={isEnabled} />
    </div>
  )
}

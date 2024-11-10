import { cn } from '@/lib/utils'
import { useAppKit } from '@/contexts/AppKitContext'
import { Checkbox } from '@/components/ui/checkbox'
import { RefreshCcwIcon, CreditCardIcon } from 'lucide-react'

export function AdvancedFeatures() {
  const { features, updateFeatures } = useAppKit()

  const toggleFeature = (featureName: 'swaps' | 'onramp') => {
    updateFeatures({ [featureName]: !features[featureName] })
  }

  return (
    <div className="space-y-4 flex-grow">
      <button
        className={cn(
          'flex items-center justify-between rounded-xl p-3 w-full',
          features.swaps
            ? 'bg-foreground/5 dark:bg-foreground/5'
            : 'bg-foreground/[2%] dark:bg-foreground/[2%]'
        )}
        onClick={() => toggleFeature('swaps')}
      >
        <span className="flex items-center gap-2 text-foreground">
          <RefreshCcwIcon
            className={cn('w-5 h-5', features.swaps ? 'text-blue-500' : 'text-gray-500')}
          />
          Token Swaps
        </span>
        <Checkbox
          className="bg-transparent border border-muted-foreground/10 data-[state=checked]:bg-blue-500 data-[state=checked]:text-white data-[state=checked]:text-xl w-6 h-6 rounded-lg"
          checked={features.swaps}
        />
      </button>

      <button
        className={cn(
          'flex items-center justify-between rounded-xl p-3 w-full',
          features.onramp
            ? 'bg-foreground/5 dark:bg-foreground/5'
            : 'bg-foreground/[2%] dark:bg-foreground/[2%]'
        )}
        onClick={() => toggleFeature('onramp')}
      >
        <span className="flex items-center gap-2 text-foreground">
          <CreditCardIcon
            className={cn('w-5 h-5', features.onramp ? 'text-blue-500' : 'text-gray-500')}
          />
          Fiat Onramp
        </span>
        <Checkbox
          className="bg-transparent border border-muted-foreground/10 data-[state=checked]:bg-blue-500 data-[state=checked]:text-white data-[state=checked]:text-xl w-6 h-6 rounded-lg"
          checked={features.onramp}
        />
      </button>
    </div>
  )
}

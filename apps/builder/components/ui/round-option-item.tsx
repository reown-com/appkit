import Image from 'next/image'

import { cn } from '@/lib/utils'

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './tooltip'

interface RoundOptionItemProps {
  enabled: boolean
  imageSrc: string
  onChange: () => void
  disabled?: boolean
  name: string
  size?: 'sm' | 'md'
  message?: string
}

export function RoundOptionItem({
  enabled,
  imageSrc,
  onChange,
  disabled,
  name,
  size = 'md',
  message
}: RoundOptionItemProps) {
  return (
    <TooltipProvider>
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>
          <button
            onClick={onChange}
            disabled={disabled}
            className={cn(
              'rounded-full transition-all flex items-center justify-center',
              size === 'sm' && 'w-10 h-10',
              size === 'md' && 'w-12 h-12',
              enabled
                ? 'border border-border-accent bg-background-accent-primary/10 dark:bg-background-accent-primary/10'
                : 'border border-neutral-300 dark:border-neutral-700',
              disabled && 'cursor-not-allowed'
            )}
          >
            <Image
              src={imageSrc}
              alt={name}
              width={size === 'sm' ? 28 : 32}
              height={size === 'sm' ? 28 : 32}
              className="rounded-2xl"
            />
          </button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{message || `${enabled ? 'Disable' : 'Enable'} ${name}`}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

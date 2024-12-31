import { cn } from '@/lib/utils'
import Image from 'next/image'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './tooltip'

interface RoundOptionItemProps {
  enabled: boolean
  imageSrc: string
  onChange: () => void
  disabled?: boolean
  name: string
}

export function RoundOptionItem({
  enabled,
  imageSrc,
  onChange,
  disabled,
  name
}: RoundOptionItemProps) {
  return (
    <TooltipProvider>
      <Tooltip delayDuration={200}>
        <TooltipTrigger asChild>
          <button
            onClick={onChange}
            disabled={disabled}
            className={cn(
              'w-12 h-12 rounded-full transition-all flex items-center justify-center border border-gray-500',
              enabled && 'border border-border-accent bg-background-accent-primary/10',
              disabled && 'opacity-50 cursor-not-allowed'
            )}
          >
            {/* <Image src={imageSrc} alt={name} width={24} height={24} /> */}
          </button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{name}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
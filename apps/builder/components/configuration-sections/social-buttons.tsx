import { cn } from '@/lib/utils'
import { Features } from '@reown/appkit-core'

type SocialOption = 'google' | 'x' | 'discord' | 'farcaster' | 'github' | 'apple' | 'facebook'

interface SocialButtonsProps {
  toggleSocial: (social: SocialOption) => void
  features: Features
}

export function SocialButtons({ toggleSocial, features }: SocialButtonsProps) {
  return (
    <div className="grid grid-cols-4 gap-2 mt-2 items-center">
      {(
        ['apple', 'google', 'x', 'github', 'farcaster', 'discord', 'facebook'] as SocialOption[]
      ).map(social => {
        const isEnabled = Array.isArray(features.socials) && features.socials.includes(social)
        return (
          <button
            key={social}
            className={cn(
              'w-10 h-10 flex items-center justify-center rounded-xl place-self-center bg-transparent border p-1',
              isEnabled
                ? 'border-blue-500 text-foreground'
                : 'border-muted-foreground/20 text-muted-foreground'
            )}
            onClick={() => toggleSocial(social)}
          >
            <wui-logo logo={social}></wui-logo>
          </button>
        )
      })}
    </div>
  )
}

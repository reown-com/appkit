import { cn } from '@/lib/utils'
import { useAppKit } from '@/contexts/AppKitContext'
import { Checkbox } from '@/components/ui/checkbox'
import { MailIcon, XIcon, WalletIcon } from 'lucide-react'
import { SocialButtons } from '@/components/features/SocialButtons'

type SocialOption = 'google' | 'x' | 'discord' | 'farcaster' | 'github' | 'apple' | 'facebook'

export function AuthFeatures() {
  const { features, updateFeatures, socialsEnabled, updateSocials } = useAppKit()

  const toggleSocial = (social: SocialOption) => {
    const currentSocials = Array.isArray(features.socials) ? features.socials : []
    const newSocials = currentSocials.includes(social)
      ? currentSocials.filter(s => s !== social)
      : [...currentSocials, social]

    updateFeatures({ socials: newSocials.length ? newSocials : false })
  }

  const toggleFeature = (featureName: 'email' | 'emailShowWallets') => {
    updateFeatures({ [featureName]: !features[featureName] })
  }

  return (
    <div className="space-y-4 flex-grow">
      <button
        className={cn(
          'flex items-center justify-between rounded-xl p-3 w-full',
          features.email
            ? 'bg-foreground/5 dark:bg-foreground/5'
            : 'bg-foreground/[2%] dark:bg-foreground/[2%]'
        )}
        onClick={() => toggleFeature('email')}
      >
        <span className="flex items-center gap-2 text-foreground">
          <MailIcon className={cn('w-5 h-5', features.email ? 'text-blue-500' : 'text-gray-500')} />
          Email
        </span>
        <Checkbox
          className="bg-transparent border border-muted-foreground/10 data-[state=checked]:bg-blue-500 data-[state=checked]:text-white data-[state=checked]:text-xl w-6 h-6 rounded-lg"
          checked={features.email}
        />
      </button>

      <button
        className={cn(
          'flex items-center justify-between rounded-xl p-3 w-full',
          Array.isArray(features.socials)
            ? 'bg-foreground/5 dark:bg-foreground/5'
            : 'bg-foreground/[2%] dark:bg-foreground/[2%]'
        )}
        onClick={() => updateSocials(!socialsEnabled)}
      >
        <span className="flex items-center gap-2 text-foreground">
          <XIcon className={cn('w-5 h-5', features.socials ? 'text-blue-500' : 'text-gray-500')} />
          Socials
        </span>
        <Checkbox
          className="bg-transparent border border-muted-foreground/10 data-[state=checked]:bg-blue-500 data-[state=checked]:text-white data-[state=checked]:text-xl w-6 h-6 rounded-lg"
          checked={Array.isArray(features.socials)}
        />
      </button>

      <SocialButtons toggleSocial={toggleSocial} features={features} />

      <button
        className={cn(
          'flex items-center justify-between rounded-xl p-3 w-full',
          features.emailShowWallets
            ? 'bg-foreground/5 dark:bg-foreground/5'
            : 'bg-foreground/[2%] dark:bg-foreground/[2%]'
        )}
        onClick={() => toggleFeature('emailShowWallets')}
      >
        <span className="flex items-center gap-2 text-foreground">
          <WalletIcon
            className={cn('w-5 h-5', features.emailShowWallets ? 'text-blue-500' : 'text-gray-500')}
          />
          Show wallets
        </span>
        <Checkbox
          className="bg-transparent border border-muted-foreground/10 data-[state=checked]:bg-blue-500 data-[state=checked]:text-white data-[state=checked]:text-xl w-6 h-6 rounded-lg"
          checked={features.emailShowWallets}
        />
      </button>
    </div>
  )
}

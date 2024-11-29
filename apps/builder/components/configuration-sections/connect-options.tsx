import { useAppKit } from '@/hooks/use-appkit'
import { SocialButtons } from '@/components/configuration-sections/social-buttons'
import { FeatureButton } from '@/components/feature-button'
import { SortableList } from '@/components/sortable-list'

type SocialOption = 'google' | 'x' | 'discord' | 'farcaster' | 'github' | 'apple' | 'facebook'

export function AuthFeatures() {
  const {
    features,
    enableWallets,
    setEnableWallets,
    updateFeatures,
    socialsEnabled,
    updateSocials
  } = useAppKit()

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
      {/* <FeatureButton
        label="Email"
        isEnabled={features.email}
        onClick={() => toggleFeature('email')}
      />
      <FeatureButton
        label="Socials"
        isEnabled={Array.isArray(features.socials)}
        onClick={() => updateSocials(!socialsEnabled)}
      />
      <SocialButtons toggleSocial={toggleSocial} features={features} />
      <FeatureButton
        label="Show wallets"
        isEnabled={enableWallets}
        onClick={() => setEnableWallets(!enableWallets)}
      /> */}
      <SortableList />
    </div>
  )
}

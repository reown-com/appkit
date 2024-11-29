import { useAppKit } from '@/hooks/use-appkit'
import { SocialButtons } from '@/components/configuration-sections/social-buttons'
import { FeatureButton } from '@/components/feature-button'
import { SortableList } from '@/components/sortable-list'

type SocialOption = 'google' | 'x' | 'discord' | 'farcaster' | 'github' | 'apple' | 'facebook'

export function AuthFeatures() {
  const { features, updateFeatures } = useAppKit()
  const collapseWallets = features.emailShowWallets

  function toggleCollapseWallets() {
    updateFeatures({ emailShowWallets: !collapseWallets })
  }

  return (
    <div className="space-y-4 flex-grow">
      <SortableList />
      <p className="text-sm text-text-secondary">Other options</p>
      <FeatureButton
        label="Collapse wallets"
        isEnabled={!collapseWallets}
        onClick={toggleCollapseWallets}
      />
    </div>
  )
}

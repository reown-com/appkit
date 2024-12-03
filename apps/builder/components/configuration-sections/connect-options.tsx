import { useAppKit } from '@/hooks/use-appkit'
import { FeatureButton } from '@/components/feature-button'
import { ConnetMethodList } from '@/components/connect-method-list'

type SocialOption = 'google' | 'x' | 'discord' | 'farcaster' | 'github' | 'apple' | 'facebook'

export function AuthFeatures() {
  const { features, updateFeatures } = useAppKit()
  const collapseWallets = features.experimental_collapseWallets

  function toggleCollapseWallets() {
    updateFeatures({ experimental_collapseWallets: !collapseWallets })
  }

  return (
    <div className="space-y-4 flex-grow">
      <ConnetMethodList />
      <p className="text-sm text-text-secondary">Other options</p>
      <FeatureButton
        label="Collapse wallets"
        isEnabled={collapseWallets}
        onClick={toggleCollapseWallets}
      />
    </div>
  )
}

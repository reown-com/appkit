import { useAppKit } from '@/hooks/use-appkit'
import { FeatureButton } from '@/components/feature-button'
import { ConnetMethodList } from '@/components/list-connect-method'

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
      <div className="flex flex-col gap-2 h-2"></div>
      <span className="text-sm text-text-secondary mt-6">Wallet options</span>
      <FeatureButton
        label="Collapse wallets"
        isEnabled={collapseWallets}
        onClick={toggleCollapseWallets}
      />
    </div>
  )
}

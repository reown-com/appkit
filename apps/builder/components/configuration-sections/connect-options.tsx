'use client'

import { useAppKit } from '@/hooks/use-appkit'
import { FeatureButton } from '@/components/feature-button'
import { ConnetMethodList } from '@/components/list-connect-method'

export function AuthFeatures() {
  const { features, updateFeatures } = useAppKit()
  const collapseWallets = features.experimental_collapseWallets

  function toggleCollapseWallets() {
    updateFeatures({ experimental_collapseWallets: !collapseWallets })
  }

  return (
    <div className="flex-grow">
      <ConnetMethodList />
      <div className="flex flex-col gap-2 h-2"></div>
      <div className="text-sm text-text-secondary mt-6 mb-2">Wallet options</div>
      <FeatureButton
        label="Collapse wallets"
        isEnabled={collapseWallets}
        onClick={toggleCollapseWallets}
      />
    </div>
  )
}

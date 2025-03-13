import { UniqueIdentifier } from '@dnd-kit/core'

import { ConstantsUtil, WalletFeature } from '@reown/appkit-controllers'
import { useAppKitAccount } from '@reown/appkit-controllers/react'

import { ExclamationMarkIcon } from '@/components/icon/exclamation-mark'
import { SortableWalletFeatureList } from '@/components/sortable-list-wallet-features'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useAppKitContext } from '@/hooks/use-appkit'
import { WalletFeatureName } from '@/lib/types'
import { urlStateUtils } from '@/lib/url-state'

const defaultWalletFeaturesOrder = ['onramp', 'swaps', 'receive', 'send']

export function SectionWalletFeatures() {
  const { caipAddress } = useAppKitAccount()
  const { config, updateFeatures } = useAppKitContext()
  const walletFeaturesOrder = config.features.walletFeaturesOrder || defaultWalletFeaturesOrder

  function handleNewOrder(items: UniqueIdentifier[]) {
    const titleValueMap = {
      Buy: 'onramp',
      Swap: 'swaps',
      Receive: 'receive',
      Send: 'send'
    }
    const newOrder = items.map(item => titleValueMap[item as WalletFeatureName] as WalletFeature)

    const currentFeatures =
      urlStateUtils.getStateFromURL()?.features || ConstantsUtil.DEFAULT_FEATURES
    updateFeatures({ ...currentFeatures, walletFeaturesOrder: newOrder })
  }

  function handleToggleOption(name: WalletFeatureName) {
    switch (name) {
      case 'Buy':
        updateFeatures({ onramp: !config.features.onramp })
        return
      case 'Swap':
        updateFeatures({ swaps: !config.features.swaps })
        return
      default:
        return
    }
  }

  const featureNameMap = walletFeaturesOrder.map(name => {
    switch (name) {
      case 'onramp':
        return 'Buy'
      case 'swaps':
        return 'Swap'
      case 'receive':
        return 'Receive'
      case 'send':
        return 'Send'
      default:
        return ''
    }
  })

  return (
    <div className="flex flex-col gap-2">
      <SortableWalletFeatureList
        items={featureNameMap}
        onToggleOption={handleToggleOption}
        handleNewOrder={handleNewOrder}
        handle={true}
      />
      {!caipAddress ? (
        <Alert>
          <div className="flex items-center gap-3">
            <ExclamationMarkIcon />
            <AlertDescription>Connect to a wallet to view feature customization</AlertDescription>
          </div>
        </Alert>
      ) : null}
    </div>
  )
}

import { UniqueIdentifier } from '@dnd-kit/core'
import { useAppKit } from '@/hooks/use-appkit'
import { WalletFeatureName } from '@/lib/types'
import { WalletFeature } from '@reown/appkit-core'
import dynamic from 'next/dynamic'

const SortableWalletFeatureList = dynamic(
  () =>
    import('@/components/sortable-list-wallet-features').then(mod => mod.SortableWalletFeatureList),
  { ssr: false }
)

const defaultWalletFeaturesOrder = ['onramp', 'swaps', 'receive', 'send']

export function WalletFeatureList() {
  const { features, updateFeatures } = useAppKit()
  const connectMethodOrder = features.experimental_walletFeaturesOrder || defaultWalletFeaturesOrder

  function handleNewOrder(items: UniqueIdentifier[]) {
    const titleValueMap = {
      Buy: 'onramp',
      Swap: 'swaps',
      Receive: 'receive',
      Send: 'send'
    }
    const newOrder = items.map(item => titleValueMap[item as WalletFeatureName] as WalletFeature)

    updateFeatures({ experimental_walletFeaturesOrder: newOrder })
  }

  function handleToggleOption(name: WalletFeatureName) {
    switch (name) {
      case 'Buy':
        updateFeatures({ onramp: !features.onramp })
        return
      case 'Swap':
        updateFeatures({ swaps: !features.swaps })
        return
      case 'Receive':
        updateFeatures({ receive: !features.receive })
        return
      case 'Send':
        updateFeatures({ send: !features.send })
        return
      default:
        return
    }
  }

  const featureNameMap = connectMethodOrder.map(name => {
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
    <SortableWalletFeatureList
      items={featureNameMap}
      onToggleOption={handleToggleOption}
      handleNewOrder={handleNewOrder}
      handle={true}
    />
  )
}

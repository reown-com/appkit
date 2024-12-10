import { UniqueIdentifier } from '@dnd-kit/core'
import { useAppKitContext } from '@/hooks/use-appkit'
import { WalletFeatureName } from '@/lib/types'
import { ConstantsUtil, WalletFeature } from '@reown/appkit-core'
import dynamic from 'next/dynamic'
import { urlStateUtils } from '@/lib/url-state'

const SortableWalletFeatureList = dynamic(
  () =>
    import('@/components/sortable-list-wallet-features').then(mod => mod.SortableWalletFeatureList),
  { ssr: false }
)

const defaultWalletFeaturesOrder = ['onramp', 'swaps', 'receive', 'send']

export function SectionWalletFeatures() {
  const { config, updateFeatures } = useAppKitContext()
  const connectMethodsOrder = config.features.walletFeaturesOrder || defaultWalletFeaturesOrder

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
      case 'Receive':
        updateFeatures({ receive: !config.features.receive })
        return
      case 'Send':
        updateFeatures({ send: !config.features.send })
        return
      default:
        return
    }
  }

  const featureNameMap = connectMethodsOrder.map(name => {
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

import { UniqueIdentifier } from '@dnd-kit/core'
import { useAppKitContext } from '@/hooks/use-appkit'
import { WalletFeatureName } from '@/lib/types'
import { ConstantsUtil, WalletFeature } from '@reown/appkit-core'
import { urlStateUtils } from '@/lib/url-state'
import { SortableWalletFeatureList } from '@/components/sortable-list-wallet-features'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useAppKitAccount } from '@reown/appkit-core/react'

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
            <svg className="min-w-[22px]" width="22" height="22" viewBox="0 0 22 22" fill="none">
              <path
                d="M11 2.0625C9.23233 2.0625 7.50436 2.58668 6.03459 3.56874C4.56483 4.55081 3.41929 5.94665 2.74283 7.57977C2.06637 9.21288 1.88938 11.0099 2.23424 12.7436C2.57909 14.4773 3.43031 16.0698 4.68024 17.3198C5.93017 18.5697 7.52268 19.4209 9.25638 19.7658C10.9901 20.1106 12.7871 19.9336 14.4202 19.2572C16.0534 18.5807 17.4492 17.4352 18.4313 15.9654C19.4133 14.4956 19.9375 12.7677 19.9375 11C19.935 8.6304 18.9926 6.35856 17.317 4.683C15.6414 3.00743 13.3696 2.065 11 2.0625ZM10.6563 6.1875C10.8602 6.1875 11.0596 6.24798 11.2292 6.3613C11.3988 6.47461 11.531 6.63567 11.609 6.82411C11.6871 7.01254 11.7075 7.21989 11.6677 7.41994C11.6279 7.61998 11.5297 7.80373 11.3855 7.94795C11.2412 8.09218 11.0575 8.19039 10.8574 8.23018C10.6574 8.26998 10.45 8.24955 10.2616 8.1715C10.0732 8.09345 9.91212 7.96127 9.7988 7.79168C9.68549 7.62209 9.625 7.42271 9.625 7.21875C9.625 6.94525 9.73365 6.68294 9.92705 6.48955C10.1204 6.29615 10.3827 6.1875 10.6563 6.1875ZM11.6875 15.8125C11.3228 15.8125 10.9731 15.6676 10.7152 15.4098C10.4574 15.1519 10.3125 14.8022 10.3125 14.4375V11C10.1302 11 9.9553 10.9276 9.82637 10.7986C9.69744 10.6697 9.625 10.4948 9.625 10.3125C9.625 10.1302 9.69744 9.9553 9.82637 9.82636C9.9553 9.69743 10.1302 9.625 10.3125 9.625C10.6772 9.625 11.0269 9.76987 11.2848 10.0277C11.5426 10.2856 11.6875 10.6353 11.6875 11V14.4375C11.8698 14.4375 12.0447 14.5099 12.1736 14.6389C12.3026 14.7678 12.375 14.9427 12.375 15.125C12.375 15.3073 12.3026 15.4822 12.1736 15.6111C12.0447 15.7401 11.8698 15.8125 11.6875 15.8125Z"
                fill="#9A9A9A"
              />
            </svg>
            <AlertDescription>Connect to a wallet to view feature customization</AlertDescription>
          </div>
        </Alert>
      ) : null}
    </div>
  )
}

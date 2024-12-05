'use client'

import { useAppKitContext } from '@/hooks/use-appkit'
import { FeatureButton } from '@/components/feature-button'

import { UniqueIdentifier } from '@dnd-kit/core'
import dynamic from 'next/dynamic'
import { ConnectMethodItemLoading } from '@/components/connect-method-item/components/loading'
import { ConnectMethod, ConstantsUtil } from '@reown/appkit-core'
import { urlStateUtils } from '@/lib/url-state'

const SortableConnectMethodList = dynamic(
  () =>
    import('@/components/sortable-list-connect-method').then(mod => mod.SortableConnectMethodList),
  {
    ssr: false,
    loading: () => (
      <div className="flex flex-col gap-3">
        <ConnectMethodItemLoading />
        <ConnectMethodItemLoading />
        <ConnectMethodItemLoading />
      </div>
    )
  }
)

export function SectionConnectOptions() {
  const { config, updateFeatures, updateSocials, updateEnableWallets } = useAppKitContext()
  const collapseWallets = config.features.experimental_collapseWallets
  const connectMethodOrder =
    config.features.experimental_connectMethodOrder ||
    ConstantsUtil.DEFAULT_FEATURES.experimental_connectMethodOrder

  function toggleCollapseWallets() {
    updateFeatures({ experimental_collapseWallets: !collapseWallets })
  }

  function handleNewOrder(items: UniqueIdentifier[]) {
    const currentFeatures =
      urlStateUtils.getStateFromURL()?.features || ConstantsUtil.DEFAULT_FEATURES
    updateFeatures({
      ...currentFeatures,
      experimental_connectMethodOrder: items as ConnectMethod[]
    })
  }

  function handleToggleOption(name: string) {
    switch (name) {
      case 'email':
        updateFeatures({ email: !config.features.email })
        return
      case 'social':
        updateSocials(!config.features.socials)
        return
      case 'wallet':
        updateEnableWallets(!config.enableWallets)
        return
      default:
        return
    }
  }

  return (
    <div className="flex-grow">
      <SortableConnectMethodList
        items={connectMethodOrder}
        onToggleOption={handleToggleOption}
        handleNewOrder={handleNewOrder}
        handle={true}
      />
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

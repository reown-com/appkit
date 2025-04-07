'use client'

import { UniqueIdentifier } from '@dnd-kit/core'
import dynamic from 'next/dynamic'

import { ConnectMethod, ConstantsUtil } from '@reown/appkit-controllers'

import { ConnectMethodItemLoading } from '@/components/connect-method-item/components/loading'
import { FeatureButton } from '@/components/feature-button'
import { RoundOptionItemLoading } from '@/components/ui/round-option-item-loading'
import { useAppKitContext } from '@/hooks/use-appkit'
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

const ChainList = dynamic(() => import('@/components/chain-list').then(mod => mod.ChainList), {
  ssr: false,
  loading: () => (
    <div className="flex gap-2 flex-wrap">
      <RoundOptionItemLoading />
      <RoundOptionItemLoading />
      <RoundOptionItemLoading />
    </div>
  )
})

const NetworkList = dynamic(
  () => import('@/components/network-list').then(mod => mod.NetworkList),
  {
    ssr: false,
    loading: () => (
      <div className="flex gap-2 flex-wrap">
        <RoundOptionItemLoading />
        <RoundOptionItemLoading />
        <RoundOptionItemLoading />
      </div>
    )
  }
)

export function SectionConnectOptions() {
  const { config, updateFeatures, updateSocials, updateEnableWallets } = useAppKitContext()
  const collapseWallets = config.features.collapseWallets
  const connectMethodsOrder = config.features.connectMethodsOrder

  function toggleCollapseWallets() {
    updateFeatures({ collapseWallets: !collapseWallets })
  }

  function handleNewOrder(items: UniqueIdentifier[]) {
    const currentFeatures =
      urlStateUtils.getStateFromURL()?.features || ConstantsUtil.DEFAULT_FEATURES
    updateFeatures({
      ...currentFeatures,
      connectMethodsOrder: items as ConnectMethod[]
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
      <div className="text-sm text-text-secondary mb-2">Connect Options</div>
      <SortableConnectMethodList
        items={connectMethodsOrder}
        onToggleOption={handleToggleOption}
        handleNewOrder={handleNewOrder}
        handle={true}
      />
      <div className="text-sm text-text-secondary mt-4 mb-2">Layout options</div>
      <FeatureButton
        label="Collapse wallets"
        isEnabled={collapseWallets}
        onClick={toggleCollapseWallets}
      />
      <div className="text-sm text-text-secondary mt-4 mb-2">Chains</div>
      <ChainList />
      <div className="text-sm text-text-secondary mt-4 mb-2">Networks</div>
      <NetworkList />
    </div>
  )
}

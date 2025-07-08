'use client'

import { type UniqueIdentifier } from '@dnd-kit/core'
import dynamic from 'next/dynamic'

import { type ConnectMethod, ConstantsUtil } from '@reown/appkit-controllers'

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
  const { config, updateFeatures, updateRemoteFeatures, updateSocials, updateEnableWallets } =
    useAppKitContext()
  const shouldCollapseWallets = config.features.collapseWallets
  const connectMethodsOrder = config.features.connectMethodsOrder

  function toggleCollapseWallets() {
    updateFeatures({ collapseWallets: !shouldCollapseWallets })
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
        updateRemoteFeatures({ email: !config.remoteFeatures.email })
        break
      case 'social':
        updateSocials(!config.remoteFeatures.socials)
        break
      case 'wallet':
        updateEnableWallets(!config.enableWallets)
        break
      default:
        break
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
        isEnabled={shouldCollapseWallets}
        onClick={toggleCollapseWallets}
      />
      <div className="text-sm text-text-secondary mt-4 mb-2">Chains</div>
      <ChainList />
      <div className="text-sm text-text-secondary mt-4 mb-2">Networks</div>
      <NetworkList />
    </div>
  )
}

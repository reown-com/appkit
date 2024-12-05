'use client'

import { useAppKitContext } from '@/hooks/use-appkit'
import { FeatureButton } from '@/components/feature-button'

import { UniqueIdentifier } from '@dnd-kit/core'
import dynamic from 'next/dynamic'
import { ConnectMethodItemLoading } from '@/components/connect-method-item/components/loading'
import { ConstantsUtil } from '@reown/appkit-core'

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
    const nameMap = {
      Email: 'email',
      Socials: 'social',
      Wallets: 'wallet'
    }
    const newOrder = items.map(
      item => nameMap[item as 'Email' | 'Socials' | 'Wallets'] as 'email' | 'social' | 'wallet'
    )

    updateFeatures({
      experimental_connectMethodOrder: newOrder
    })
  }

  function handleToggleOption(name: 'Email' | 'Socials' | 'Wallets') {
    switch (name) {
      case 'Email':
        updateFeatures({ email: !config.features.email })
        return
      case 'Socials':
        updateSocials(!config.features.socials)
        return
      case 'Wallets':
        updateEnableWallets(!config.enableWallets)
        return
      default:
        return
    }
  }

  const connectMethodNameMap = connectMethodOrder?.map(name => {
    switch (name) {
      case 'email':
        return 'Email'
      case 'social':
        return 'Socials'
      case 'wallet':
        return 'Wallets'
    }
  })

  return (
    <div className="flex-grow">
      <SortableConnectMethodList
        items={connectMethodNameMap}
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

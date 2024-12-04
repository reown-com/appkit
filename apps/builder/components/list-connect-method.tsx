import { UniqueIdentifier } from '@dnd-kit/core'
import { useAppKitContext } from '@/hooks/use-appkit'
import dynamic from 'next/dynamic'
import { ConnectMethodItemLoading } from '@/components/connect-method-item/components/loading'

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

export function ConnetMethodList() {
  const {
    features,
    enableWallets,
    socialsEnabled,
    updateSocials,
    updateFeatures,
    setEnableWallets
  } = useAppKitContext()
  const connectMethodOrder = features.experimental_connectMethodOrder || [
    'email',
    'social',
    'wallet'
  ]

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
        updateFeatures({ email: !features.email })
        return
      case 'Socials':
        updateSocials(!socialsEnabled)
        return
      case 'Wallets':
        setEnableWallets(!enableWallets)
        return
      default:
        return
    }
  }

  const connectMethodNameMap = connectMethodOrder.map(name => {
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
    <SortableConnectMethodList
      items={connectMethodNameMap}
      onToggleOption={handleToggleOption}
      handleNewOrder={handleNewOrder}
      handle={true}
    />
  )
}

import { UniqueIdentifier } from '@dnd-kit/core'
import { SortableConnectMethodList } from '@/components/sortable-connect-method-list'
import { useAppKit } from '@/hooks/use-appkit'

type SocialOption = 'google' | 'x' | 'discord' | 'farcaster' | 'github' | 'apple' | 'facebook'

export function ConnetMethodList() {
  const {
    features,
    enableWallets,
    socialsEnabled,
    updateSocials,
    updateFeatures,
    setEnableWallets
  } = useAppKit()
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

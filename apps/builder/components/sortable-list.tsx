import { UniqueIdentifier } from '@dnd-kit/core'
import { Sortable } from '@/components/sortable-item'
import { useAppKit } from '@/hooks/use-appkit'

type SocialOption = 'google' | 'x' | 'discord' | 'farcaster' | 'github' | 'apple' | 'facebook'

export function SortableList() {
  const {
    features,
    enableWallets,
    socialsEnabled,
    updateSocials,
    updateFeatures,
    setEnableWallets,
    setConnectMethodOrder
  } = useAppKit()

  function handleNewOrder(items: UniqueIdentifier[]) {
    const nameMap = {
      Email: 'email',
      Socials: 'social',
      Wallets: 'wallet'
    }
    const newOrder = items.map(
      item => nameMap[item as 'Email' | 'Socials' | 'Wallets'] as 'email' | 'social' | 'wallet'
    )

    setConnectMethodOrder(newOrder)
    console.log(newOrder, items)
  }

  function handleToggleOption(name: 'Email' | 'Socials' | 'Wallets') {
    switch (name) {
      case 'Email':
        console.log('Email')
        updateFeatures({ email: !features.email })
        return
      case 'Socials':
        console.log('Socials')
        updateSocials(!socialsEnabled)
        return
      case 'Wallets':
        console.log('Wallets')
        setEnableWallets(!enableWallets)
        return
      default:
        return
    }
  }

  return (
    <Sortable
      items={['Email', 'Socials', 'Wallets']}
      onToggleOption={handleToggleOption}
      handleNewOrder={handleNewOrder}
      handle={true}
    />
  )
}

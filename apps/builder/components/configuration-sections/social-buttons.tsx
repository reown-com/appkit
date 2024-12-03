import { SortableSocialGrid } from '@/components/sortable-social-grid'
import { useAppKit } from '@/hooks/use-appkit'
import { UniqueIdentifier } from '@dnd-kit/core'

type SocialOption = 'google' | 'x' | 'discord' | 'farcaster' | 'github' | 'apple' | 'facebook'

const defaultSocialsOrder: SocialOption[] = [
  'google',
  'x',
  'discord',
  'farcaster',
  'github',
  'apple',
  'facebook'
]

interface SocialButtonsProps {
  connectMethodDragging: boolean
}

export function SocialButtons({ connectMethodDragging }: SocialButtonsProps) {
  const { features, updateFeatures } = useAppKit()
  const socials = features.socials || defaultSocialsOrder

  function handleNewOrder(items: UniqueIdentifier[]) {
    updateFeatures({ socials: items as SocialOption[] })
  }

  return (
    <SortableSocialGrid
      items={socials}
      handleNewOrder={handleNewOrder}
      activationConstraint={{
        distance: 10
      }}
      connectMethodDragging={connectMethodDragging}
    />
  )
}

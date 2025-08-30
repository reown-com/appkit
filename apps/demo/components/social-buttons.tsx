import { type UniqueIdentifier } from '@dnd-kit/core'

import { ConstantsUtil, type SocialProvider } from '@reown/appkit-controllers'

import { SortableSocialGrid } from '@/components/sortable-social-grid'
import { useAppKitContext } from '@/hooks/use-appkit'

const allSocials = ConstantsUtil.DEFAULT_SOCIALS

export function SocialButtons() {
  const { updateRemoteFeatures } = useAppKitContext()

  function handleNewOrder(items: UniqueIdentifier[]) {
    updateRemoteFeatures({ socials: items as SocialProvider[] })
  }

  return (
    <SortableSocialGrid
      items={allSocials}
      handleNewOrder={handleNewOrder}
      activationConstraint={{
        distance: 10
      }}
    />
  )
}

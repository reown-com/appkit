import { UniqueIdentifier } from '@dnd-kit/core'

import { ConstantsUtil, SocialProvider } from '@reown/appkit-controllers'

import { SortableSocialGrid } from '@/components/sortable-social-grid'
import { useAppKitContext } from '@/hooks/use-appkit'

const allSocials = ConstantsUtil.DEFAULT_FEATURES.socials as SocialProvider[]

export function SocialButtons() {
  const { updateFeatures } = useAppKitContext()

  function handleNewOrder(items: UniqueIdentifier[]) {
    updateFeatures({ socials: items as SocialProvider[] })
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

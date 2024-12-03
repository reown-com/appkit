import { SortableSocialGrid } from '@/components/sortable-social-grid'
import { useAppKit } from '@/hooks/use-appkit'
import { SocialOption } from '@/lib/types'
import { UniqueIdentifier } from '@dnd-kit/core'
import { ConstantsUtil, FeaturesSocials } from '@reown/appkit-core'

const allSocials = ConstantsUtil.DEFAULT_FEATURES.socials as FeaturesSocials[]

export function SocialButtons() {
  const { updateFeatures } = useAppKit()

  function handleNewOrder(items: UniqueIdentifier[]) {
    updateFeatures({ socials: items as SocialOption[] })
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

import { SortableSocialGrid } from '@/components/sortable-social-grid'
import { useAppKitContext } from '@/hooks/use-appkit'
import { urlStateUtils } from '@/lib/url-state'
import { UniqueIdentifier } from '@dnd-kit/core'
import { ConstantsUtil, SocialProvider } from '@reown/appkit-core'

const allSocials = ConstantsUtil.DEFAULT_FEATURES.socials as SocialProvider[]

export function SocialButtons() {
  const { updateFeatures } = useAppKitContext()

  function handleNewOrder(items: UniqueIdentifier[]) {
    const currentFeatures =
      urlStateUtils.getStateFromURL()?.features || ConstantsUtil.DEFAULT_FEATURES
    updateFeatures({ ...currentFeatures, socials: items as SocialProvider[] })
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

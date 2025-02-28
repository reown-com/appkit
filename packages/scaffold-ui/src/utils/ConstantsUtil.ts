import { SystemUtil } from '@reown/appkit-common'
import type { ConnectMethod } from '@reown/appkit-core'

export const ConstantsUtil = {
  ACCOUNT_TABS: [{ label: 'Tokens' }, { label: 'NFTs' }, { label: 'Activity' }],
  SECURE_SITE_ORIGIN: SystemUtil.getEnv(
    'NEXT_PUBLIC_SECURE_SITE_ORIGIN',
    'https://secure.walletconnect.org'
  ),
  VIEW_DIRECTION: {
    Next: 'next',
    Prev: 'prev'
  },
  DEFAULT_CONNECT_METHOD_ORDER: ['email', 'social', 'wallet'] as ConnectMethod[],
  ANIMATION_DURATIONS: {
    HeaderText: 120,
    ModalHeight: 150,
    ViewTransition: 150
  }
}

import type { ConnectMethod } from '@reown/appkit-controllers'

export const ConstantsUtil = {
  ACCOUNT_TABS: [{ label: 'Tokens' }, { label: 'Activity' }],
  SECURE_SITE_ORIGIN:
    // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
    (typeof process !== 'undefined' && typeof process.env !== 'undefined'
      ? process.env['NEXT_PUBLIC_SECURE_SITE_ORIGIN']
      : undefined) || 'https://secure.walletconnect.org',
  VIEW_DIRECTION: {
    Next: 'next',
    Prev: 'prev'
  },
  DEFAULT_CONNECT_METHOD_ORDER: ['email', 'social', 'wallet'] as ConnectMethod[],
  ANIMATION_DURATIONS: {
    HeaderText: 120,
    ModalHeight: 150,
    ViewTransition: 150
  },
  VIEWS_WITH_LEGAL_FOOTER: [
    'Connect',
    'ConnectWallets',
    'OnRampTokenSelect',
    'OnRampFiatSelect',
    'OnRampProviders'
  ],
  VIEWS_WITH_DEFAULT_FOOTER: ['Networks']
}

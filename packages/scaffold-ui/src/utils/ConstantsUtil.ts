export const ConstantsUtil = {
  ACCOUNT_TABS: [{ label: 'Tokens' }, { label: 'NFTs' }, { label: 'Activity' }],
  SECURE_SITE_ORIGIN:
    process.env['NEXT_PUBLIC_SECURE_SITE_ORIGIN'] || 'https://secure.walletconnect.org',
  VIEW_DIRECTION: {
    Next: 'next',
    Prev: 'prev'
  },
  ANIMATION_DURATIONS: {
    HeaderText: 120,
    ModalHeight: 150,
    ViewTransition: 150
  }
}

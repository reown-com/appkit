export const ConstantsUtil = {
  ACCOUNT_TABS: [{ label: 'Tokens' }, { label: 'NFTs' }, { label: 'Activity' }],
  SECURE_SITE_ORIGIN:
    process.env['NEXT_PUBLIC_SECURE_SITE_ORIGIN'] || 'https://secure.walletconnect.org'
}

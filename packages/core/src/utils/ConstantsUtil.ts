const SECURE_SITE = 'https://secure.web3modal.com'

export const ConstantsUtil = {
  FOUR_MINUTES_MS: 240_000,

  TEN_SEC_MS: 10_000,

  ONE_SEC_MS: 1_000,

  SECURE_SITE,

  SECURE_SITE_DASHBOARD: `${SECURE_SITE}/dashboard`,

  SECURE_SITE_FAVICON: `${SECURE_SITE}/images/favicon.png`,

  RESTRICTED_TIMEZONES: [
    'ASIA/SHANGHAI',
    'ASIA/URUMQI',
    'ASIA/CHONGQING',
    'ASIA/HARBIN',
    'ASIA/KASHGAR',
    'ASIA/MACAU',
    'ASIA/HONG_KONG',
    'ASIA/MACAO',
    'ASIA/BEIJING',
    'ASIA/HARBIN'
  ],

  CONNECTOR_RDNS_MAP: {
    coinbaseWallet: 'com.coinbase.wallet'
  } as Record<string, string>
}

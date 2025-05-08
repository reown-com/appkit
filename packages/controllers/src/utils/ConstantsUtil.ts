import { type ChainNamespace } from '@reown/appkit-common'

import type { Features, PreferredAccountTypes, SocialProvider } from './TypeUtil.js'

const SECURE_SITE =
  // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
  (typeof process !== 'undefined' && typeof process.env !== 'undefined'
    ? process.env['NEXT_PUBLIC_SECURE_SITE_ORIGIN']
    : undefined) || 'https://secure.walletconnect.org'

export const ONRAMP_PROVIDERS = [
  {
    label: 'Coinbase',
    name: 'coinbase',
    feeRange: '1-2%',
    url: '',
    supportedChains: ['eip155']
  },
  {
    label: 'Meld.io',
    name: 'meld',
    feeRange: '1-2%',
    url: 'https://meldcrypto.com',
    supportedChains: ['eip155', 'solana']
  }
]

export const MELD_PUBLIC_KEY = 'WXETMuFUQmqqybHuRkSgxv:25B8LJHSfpG6LVjR2ytU5Cwh7Z4Sch2ocoU'

export const ConstantsUtil = {
  FOUR_MINUTES_MS: 240_000,

  TEN_SEC_MS: 10_000,

  FIVE_SEC_MS: 5_000,

  THREE_SEC_MS: 3_000,

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

  /**
   * Network name to Coinbase Pay SDK chain name map object
   * @see supported chain names on Coinbase for Pay SDK: https://github.com/coinbase/cbpay-js/blob/d4bda2c05c4d5917c8db6a05476b603546046394/src/types/onramp.ts
   */
  WC_COINBASE_PAY_SDK_CHAINS: [
    'ethereum',
    'arbitrum',
    'polygon',
    'berachain',
    'avalanche-c-chain',
    'optimism',
    'celo',
    'base'
  ],

  WC_COINBASE_PAY_SDK_FALLBACK_CHAIN: 'ethereum',

  WC_COINBASE_PAY_SDK_CHAIN_NAME_MAP: {
    Ethereum: 'ethereum',
    'Arbitrum One': 'arbitrum',
    Polygon: 'polygon',
    Berachain: 'berachain',
    Avalanche: 'avalanche-c-chain',
    'OP Mainnet': 'optimism',
    Celo: 'celo',
    Base: 'base'
  },

  WC_COINBASE_ONRAMP_APP_ID: 'bf18c88d-495a-463b-b249-0b9d3656cf5e',

  SWAP_SUGGESTED_TOKENS: [
    'ETH',
    'UNI',
    '1INCH',
    'AAVE',
    'SOL',
    'ADA',
    'AVAX',
    'DOT',
    'LINK',
    'NITRO',
    'GAIA',
    'MILK',
    'TRX',
    'NEAR',
    'GNO',
    'WBTC',
    'DAI',
    'WETH',
    'USDC',
    'USDT',
    'ARB',
    'BAL',
    'BICO',
    'CRV',
    'ENS',
    'MATIC',
    'OP'
  ],

  SWAP_POPULAR_TOKENS: [
    'ETH',
    'UNI',
    '1INCH',
    'AAVE',
    'SOL',
    'ADA',
    'AVAX',
    'DOT',
    'LINK',
    'NITRO',
    'GAIA',
    'MILK',
    'TRX',
    'NEAR',
    'GNO',
    'WBTC',
    'DAI',
    'WETH',
    'USDC',
    'USDT',
    'ARB',
    'BAL',
    'BICO',
    'CRV',
    'ENS',
    'MATIC',
    'OP',

    'METAL',
    'DAI',
    'CHAMP',
    'WOLF',
    'SALE',
    'BAL',
    'BUSD',
    'MUST',
    'BTCpx',
    'ROUTE',
    'HEX',
    'WELT',
    'amDAI',
    'VSQ',
    'VISION',
    'AURUM',
    'pSP',
    'SNX',
    'VC',
    'LINK',
    'CHP',
    'amUSDT',
    'SPHERE',
    'FOX',
    'GIDDY',
    'GFC',
    'OMEN',
    'OX_OLD',
    'DE',
    'WNT'
  ],
  BALANCE_SUPPORTED_CHAINS: ['eip155', 'solana'] as ChainNamespace[],
  SWAP_SUPPORTED_NETWORKS: [
    // Ethereum'
    'eip155:1',
    // Arbitrum One'
    'eip155:42161',
    // Optimism'
    'eip155:10',
    // ZKSync Era'
    'eip155:324',
    // Base'
    'eip155:8453',
    // BNB Smart Chain'
    'eip155:56',
    // Polygon'
    'eip155:137',
    // Gnosis'
    'eip155:100',
    // Avalanche'
    'eip155:43114',
    // Fantom'
    'eip155:250',
    // Klaytn'
    'eip155:8217',
    // Aurora
    'eip155:1313161554'
  ],

  NAMES_SUPPORTED_CHAIN_NAMESPACES: ['eip155'] as ChainNamespace[],
  ONRAMP_SUPPORTED_CHAIN_NAMESPACES: ['eip155', 'solana'] as ChainNamespace[],
  ACTIVITY_ENABLED_CHAIN_NAMESPACES: ['eip155'] as ChainNamespace[],
  NATIVE_TOKEN_ADDRESS: {
    eip155: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
    solana: 'So11111111111111111111111111111111111111111',
    polkadot: '0x',
    bip122: '0x',
    cosmos: '0x'
  } as const satisfies Record<ChainNamespace, string>,

  CONVERT_SLIPPAGE_TOLERANCE: 1,

  CONNECT_LABELS: {
    MOBILE: 'Open and continue in a new browser tab'
  },

  SEND_SUPPORTED_NAMESPACES: ['eip155', 'solana'] as ChainNamespace[],
  DEFAULT_FEATURES: {
    swaps: true,
    onramp: true,
    receive: true,
    send: true,
    email: true,
    emailShowWallets: true,
    socials: [
      'google',
      'x',
      'discord',
      'farcaster',
      'github',
      'apple',
      'facebook'
    ] as SocialProvider[],
    connectorTypeOrder: [
      'walletConnect',
      'recent',
      'injected',
      'featured',
      'custom',
      'external',
      'recommended'
    ],
    history: true,
    analytics: true,
    allWallets: true,
    legalCheckbox: false,
    smartSessions: false,
    collapseWallets: false,
    walletFeaturesOrder: ['onramp', 'swaps', 'receive', 'send'],
    connectMethodsOrder: undefined,
    pay: false
  } satisfies Features,

  DEFAULT_ACCOUNT_TYPES: {
    bip122: 'payment',
    eip155: 'smartAccount',
    polkadot: 'eoa',
    solana: 'eoa'
  } as const satisfies PreferredAccountTypes,
  ADAPTER_TYPES: {
    UNIVERSAL: 'universal',
    SOLANA: 'solana',
    WAGMI: 'wagmi',
    ETHERS: 'ethers',
    ETHERS5: 'ethers5',
    BITCOIN: 'bitcoin'
  }
}

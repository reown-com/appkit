import { ConstantsUtil as CommonConstantsUtil, PresetsUtil } from '@reown/appkit-common'
import {
  type ChainNamespace,
  type OnRampProvider,
  type SocialProvider,
  type SwapProvider
} from '@reown/appkit-common'

import type { SIWXConfig } from './SIWXUtil.js'
import type { ConnectMethod, Features, PreferredAccountTypes, RemoteFeatures } from './TypeUtil.js'

const SECURE_SITE =
  // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
  (typeof process !== 'undefined' && typeof process.env !== 'undefined'
    ? process.env['NEXT_PUBLIC_SECURE_SITE_ORIGIN']
    : undefined) || 'https://secure.walletconnect.org'

export const ONRAMP_PROVIDERS = [
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

  SOLANA_NATIVE_TOKEN_ADDRESS: 'So11111111111111111111111111111111111111111',

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
  SUGGESTED_TOKENS_BY_CHAIN: {
    // Arbitrum One
    'eip155:42161': ['USD₮0']
  },
  BALANCE_SUPPORTED_CHAINS: [
    CommonConstantsUtil.CHAIN.EVM,
    CommonConstantsUtil.CHAIN.SOLANA
  ] as ChainNamespace[],
  SEND_PARAMS_SUPPORTED_CHAINS: [CommonConstantsUtil.CHAIN.EVM] as ChainNamespace[],
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

  NAMES_SUPPORTED_CHAIN_NAMESPACES: [CommonConstantsUtil.CHAIN.EVM] as ChainNamespace[],
  ONRAMP_SUPPORTED_CHAIN_NAMESPACES: [
    CommonConstantsUtil.CHAIN.EVM,
    CommonConstantsUtil.CHAIN.SOLANA
  ] as ChainNamespace[],
  PAY_WITH_EXCHANGE_SUPPORTED_CHAIN_NAMESPACES: [
    CommonConstantsUtil.CHAIN.EVM,
    CommonConstantsUtil.CHAIN.SOLANA
  ] as ChainNamespace[],
  ACTIVITY_ENABLED_CHAIN_NAMESPACES: [
    CommonConstantsUtil.CHAIN.EVM,
    CommonConstantsUtil.CHAIN.TON
  ] as ChainNamespace[],
  NATIVE_TOKEN_ADDRESS: {
    eip155: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
    solana: 'So11111111111111111111111111111111111111111',
    polkadot: '0x',
    bip122: '0x',
    cosmos: '0x',
    sui: '0x',
    stacks: '0x',
    ton: '0x'
  } as const satisfies Record<ChainNamespace, string>,

  CONVERT_SLIPPAGE_TOLERANCE: 1,

  CONNECT_LABELS: {
    MOBILE: 'Open and continue in the wallet app',
    WEB: 'Open and continue in the wallet app'
  },

  SEND_SUPPORTED_NAMESPACES: [
    CommonConstantsUtil.CHAIN.EVM,
    CommonConstantsUtil.CHAIN.SOLANA
  ] as ChainNamespace[],
  DEFAULT_REMOTE_FEATURES: {
    swaps: ['1inch'] as SwapProvider[],
    onramp: ['meld'] as OnRampProvider[],
    email: true,
    socials: [
      'google',
      'x',
      'discord',
      'farcaster',
      'github',
      'apple',
      'facebook'
    ] as SocialProvider[],
    activity: true,
    reownBranding: true,
    multiWallet: false,
    emailCapture: false,
    payWithExchange: false,
    payments: false,
    reownAuthentication: false,
    headless: false
  },
  DEFAULT_REMOTE_FEATURES_DISABLED: {
    email: false,
    socials: false,
    swaps: false,
    onramp: false,
    activity: false,
    reownBranding: false,
    emailCapture: false,
    reownAuthentication: false,
    headless: false
  } as const satisfies RemoteFeatures,
  DEFAULT_FEATURES: {
    receive: true,
    send: true,
    emailShowWallets: true,
    connectorTypeOrder: [
      'walletConnect',
      'recent',
      'injected',
      'featured',
      'custom',
      'external',
      'recommended'
    ],
    analytics: true,
    allWallets: true,
    legalCheckbox: false,
    smartSessions: false,
    collapseWallets: false,
    walletFeaturesOrder: ['onramp', 'swaps', 'receive', 'send'],
    connectMethodsOrder: undefined,
    pay: false,
    reownAuthentication: false,
    headless: false
  } satisfies Features,

  DEFAULT_SOCIALS: [
    'google',
    'x',
    'farcaster',
    'discord',
    'apple',
    'github',
    'facebook'
  ] as SocialProvider[],

  DEFAULT_ACCOUNT_TYPES: {
    bip122: 'payment',
    eip155: 'smartAccount',
    polkadot: 'eoa',
    solana: 'eoa',
    ton: 'eoa'
  } as const satisfies PreferredAccountTypes,
  ADAPTER_TYPES: {
    UNIVERSAL: 'universal',
    SOLANA: 'solana',
    WAGMI: 'wagmi',
    ETHERS: 'ethers',
    ETHERS5: 'ethers5',
    BITCOIN: 'bitcoin'
  },

  SIWX_DEFAULTS: {
    signOutOnDisconnect: true
  } as const satisfies Pick<SIWXConfig, 'signOutOnDisconnect'>,

  MANDATORY_WALLET_IDS_ON_MOBILE: [
    PresetsUtil.ConnectorExplorerIds[CommonConstantsUtil.CONNECTOR_ID.COINBASE],
    PresetsUtil.ConnectorExplorerIds[CommonConstantsUtil.CONNECTOR_ID.COINBASE_SDK],
    PresetsUtil.ConnectorExplorerIds[CommonConstantsUtil.CONNECTOR_ID.BASE_ACCOUNT],
    PresetsUtil.ConnectorExplorerIds[CommonConstantsUtil.SOLFLARE_CONNECTOR_NAME],
    PresetsUtil.ConnectorExplorerIds[CommonConstantsUtil.PHANTOM_CONNECTOR_NAME],
    PresetsUtil.ConnectorExplorerIds[CommonConstantsUtil.BINANCE_CONNECTOR_NAME]
  ],

  DEFAULT_CONNECT_METHOD_ORDER: ['email', 'social', 'wallet'] as ConnectMethod[]
}

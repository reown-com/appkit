import type { CaipNetwork, SocialProvider } from '@reown/appkit'
import type { Wallet } from '@reown/appkit-wallet-button'
import {
  abstract,
  arbitrum,
  aurora,
  base,
  baseSepolia,
  berachain,
  bitcoin,
  bitcoinTestnet,
  gnosis,
  hedera,
  mainnet,
  mantle,
  monadTestnet,
  optimism,
  polygon,
  sepolia,
  solana,
  solanaDevnet,
  solanaTestnet,
  unichainSepolia,
  zkSync
} from '@reown/appkit/networks'
import type { AppKitNetwork } from '@reown/appkit/networks'

import { getLocalStorageItem } from './LocalStorage'

const projectId = process.env['NEXT_PUBLIC_PROJECT_ID']
if (!projectId) {
  throw new Error('NEXT_PUBLIC_PROJECT_ID is not set')
}
export const WALLET_URL = process.env['WALLET_URL'] || 'https://react-wallet.walletconnect.com/'
export const USEROP_BUILDER_SERVICE_BASE_URL = 'https://rpc.walletconnect.org/v1/wallet'

export const GALLERY_URL = 'https://appkit-gallery.reown.com/'
export const DOCS_URL = 'https://docs.reown.com/appkit/overview'
export const REPO_URL = 'https://github.com/reown-com/appkit'

export function getPublicUrl() {
  const isProduction = process.env['NODE_ENV'] === 'production'
  if (isProduction) {
    return 'https://appkit-lab.reown.com'
  }

  const publicUrl = process.env['NEXT_PUBLIC_PUBLIC_URL']
  if (publicUrl) {
    return publicUrl
  }

  const vercelUrl = process.env['NEXT_PUBLIC_VERCEL_URL']
  if (vercelUrl) {
    return `https://${vercelUrl}`
  }

  return 'https://appkit-lab.reown.org'
}

export const CUSTOM_WALLET = 'wc:custom_wallet'

interface CustomWallet {
  id: string
  name: string
  image_url?: string
  mobile_link?: string
  desktop_link?: string
  webapp_link?: string
}

// Get custom wallets from localStorage
function getCustomWallets(): CustomWallet[] {
  try {
    const storedCustomWallet = getLocalStorageItem(CUSTOM_WALLET)
    return storedCustomWallet ? JSON.parse(storedCustomWallet) : []
  } catch (error) {
    console.error('Error getting custom wallets:', error)
    return []
  }
}

// Filter out custom wallets from recent wallets
function filterRecentWallets(recentWallets: string[]) {
  const customWallets = getCustomWallets()
  const customWalletIds = new Set(customWallets.map(wallet => wallet.id))
  return recentWallets.filter(walletId => !customWalletIds.has(walletId))
}

const EvmNetworks = [
  mainnet,
  optimism,
  polygon,
  zkSync,
  arbitrum,
  base,
  baseSepolia,
  unichainSepolia,
  berachain,
  sepolia,
  gnosis,
  hedera,
  aurora,
  mantle,
  abstract,
  monadTestnet
] as [AppKitNetwork, ...AppKitNetwork[]]

export const solanaNotExist = {
  id: 'chaindoesntexist',
  caipNetworkId: 'solana:chaindoesntexist',
  chainNamespace: 'solana',
  name: 'Solana Unsupported',
  nativeCurrency: { name: 'Solana', symbol: 'SOL', decimals: 9 },
  blockExplorers: {
    default: { name: 'Solscan', url: 'https://explorer.solana.com/?cluster=unsupported' }
  },
  rpcUrls: { default: { http: ['https://api.unsupported.solana.com'] } }
} as CaipNetwork

const SolanaNetworks = [solana, solanaTestnet, solanaDevnet, solanaNotExist] as [
  AppKitNetwork,
  ...AppKitNetwork[]
]

const BitcoinNetworks = [bitcoin, bitcoinTestnet] as [AppKitNetwork, ...AppKitNetwork[]]

export const ConstantsUtil = {
  SigningSucceededToastTitle: 'Signing Succeeded',
  SigningFailedToastTitle: 'Signing Failed',
  TestIdSiweAuthenticationStatus: 'w3m-authentication-status',
  DisconnectingSuccessToastTitle: 'Disconnecting Succeeded',
  DisconnectingFailedToastTitle: 'Disconnecting Failed',
  Metadata: {
    name: 'AppKit Lab',
    description: 'Laboratory environment for AppKit testing',
    url: getPublicUrl(),
    icons: [`${getPublicUrl()}/metadata-icon.png`],
    verifyUrl: ''
  },
  CustomWallets: getCustomWallets(),
  ProjectId: projectId,
  EvmNetworks,
  SolanaNetworks,
  BitcoinNetworks,
  AllNetworks: [...EvmNetworks, ...SolanaNetworks, ...BitcoinNetworks] as [
    AppKitNetwork,
    ...AppKitNetwork[]
  ],
  EvmWalletButtons: [
    'walletConnect',
    'metamask',
    'trust',
    'coinbase',
    'rainbow',
    'phantom',
    'haha'
  ] as Wallet[],
  SolanaWalletButtons: [
    'walletConnect',
    'metamask',
    'trust',
    'coinbase',
    'jupiter',
    'solflare',
    'phantom',
    'coin98',
    'magic-eden',
    'backpack',
    'frontier'
  ] as Wallet[],
  BitcoinWalletButtons: ['walletConnect', 'xverse', 'leather', 'okx', 'phantom'] as Wallet[],
  Socials: [
    'google',
    'github',
    'apple',
    'facebook',
    'x',
    'discord',
    'farcaster'
  ] as SocialProvider[],
  Email: 'email' as const
}

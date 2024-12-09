import {
  arbitrum,
  mainnet,
  optimism,
  polygon,
  zkSync,
  sepolia,
  solana,
  solanaTestnet,
  solanaDevnet,
  base,
  baseSepolia,
  gnosis,
  unichainSepolia,
  hedera,
  aurora,
  mantle,
  bitcoin,
  bitcoinTestnet
} from '@reown/appkit/networks'
import type { AppKitNetwork } from '@reown/appkit/networks'
import { getLocalStorageItem } from './LocalStorage'
import type { CaipNetwork } from '@reown/appkit'

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

// eslint-disable-next-line init-declarations
let storedCustomWallet
if (typeof window !== 'undefined') {
  storedCustomWallet = getLocalStorageItem(CUSTOM_WALLET)
}

const customWallet = storedCustomWallet ? [JSON.parse(storedCustomWallet)] : []

const EvmNetworks = [
  mainnet,
  optimism,
  polygon,
  zkSync,
  arbitrum,
  base,
  baseSepolia,
  unichainSepolia,
  sepolia,
  gnosis,
  hedera,
  aurora,
  mantle
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
  CustomWallets: [
    ...customWallet,
    {
      id: 'react-wallet-v2',
      name: 'React Sample Wallet',
      homepage: WALLET_URL,
      mobile_link: WALLET_URL,
      desktop_link: WALLET_URL,
      webapp_link: WALLET_URL,
      image_url: '/sample-wallets/react.svg'
    },
    {
      id: 'kotlin-web3wallet',
      name: 'Kotlin Sample Wallet',
      homepage: 'https://walletconnect.com',
      mobile_link: 'kotlin-web3wallet://',
      image_url: '/sample-wallets/kotlin.svg'
    },
    {
      id: 'swift-web3wallet',
      name: 'Swift Sample Wallet',
      homepage: 'https://walletconnect.com',
      mobile_link: 'walletapp://',
      image_url: '/sample-wallets/swift.svg'
    },
    {
      id: 'flutter-web3wallet',
      name: 'Flutter Sample Wallet',
      homepage: 'https://walletconnect.com',
      mobile_link: 'wcflutterwallet://',
      image_url: '/sample-wallets/flutter.svg'
    },
    {
      id: 'rn-web3wallet',
      name: 'React Native Sample Wallet',
      homepage: 'https://walletconnect.com',
      mobile_link: 'rn-web3wallet://',
      image_url: '/sample-wallets/react-native.svg'
    }
  ],
  ProjectId: projectId,
  EvmNetworks,
  SolanaNetworks,
  BitcoinNetworks,
  AllNetworks: [...EvmNetworks, ...SolanaNetworks] as [AppKitNetwork, ...AppKitNetwork[]],
  WalletButtons: {
    MetaMask: 'c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96',
    Trust: '4622a2b2d6af1c9844944291e5e7351a6aa24cd7b23099efac1b2fd875da31a0',
    Rainbow: '1ae92b26df02f0abca6304df07debccd18262fdf5fe82daa81593582dac9a369',
    Uniswap: 'c03dfee351b6fcc421b4494ea33b9d4b92a984f87aa76d1663bb28705e95034a',
    Ledger: '19177a98252e07ddfc9af2083ba8e07ef627cb6103467ffebb3f8f4205fd7927'
  } as const
}

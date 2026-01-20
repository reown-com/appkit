import type { CreateConfigParameters } from 'wagmi'

import { CoreHelperUtil, type CreateAppKit } from '@reown/appkit'
import type { AppKitNetwork, CustomRpcUrlMap } from '@reown/appkit-common'
import { DefaultSIWX, ReownAuthentication } from '@reown/appkit-siwx'

import { ConstantsUtil } from '@/src/utils/ConstantsUtil'
import { siweConfig } from '@/src/utils/SiweUtils'

import { externalTestConnector } from '../utils/ConnectorUtil'

export type Adapter = 'wagmi' | 'ethers' | 'ethers5' | 'solana' | 'bitcoin' | 'ton'
export type WagmiConfig = Partial<CreateConfigParameters> & {
  networks: AppKitNetwork[]
  projectId: string
  customRpcUrls?: CustomRpcUrlMap
}
export type AppKitConfigObject = Record<
  string,
  Omit<CreateAppKit, 'projectId' | 'adapters'> & {
    projectId?: string
    wagmiConfig?: WagmiConfig
    adapters?: Adapter[]
    siwxReown?: boolean
  }
>

const customRpcUrls = {
  'eip155:1': [{ url: 'https://ethereum-rpc.publicnode.com' }],
  'eip155:137': [{ url: 'https://polygon-bor-rpc.publicnode.com' }],
  'eip155:42161': [{ url: 'https://arbitrum-rpc.publicnode.com' }],
  'eip155:10': [{ url: 'https://optimism-rpc.publicnode.com' }],
  'eip155:100': [{ url: 'https://gnosis-rpc.publicnode.com' }],
  'eip155:8453': [{ url: 'https://base-rpc.publicnode.com' }]
}
const connectors = [externalTestConnector()]
const metadata = {
  name: 'AppKit',
  description: 'AppKit Laboratory',
  // eslint-disable-next-line no-negated-condition
  url: CoreHelperUtil.isClient() ? window.location.origin : '',
  icons: ['https://lab.reown.com/logo.png']
}
const commonAppKitConfig = {
  termsConditionsUrl: 'https://reown.com/terms-of-service',
  privacyPolicyUrl: 'https://reown.com/privacy-policy',
  customWallets: ConstantsUtil.CustomWallets,
  projectId: ConstantsUtil.ProjectId,
  metadata
}
const commonWagmiConfig = {
  ssr: true,
  networks: ConstantsUtil.AllNetworks,
  projectId: ConstantsUtil.ProjectId
} as WagmiConfig

export const appKitConfigs = {
  headless: {
    ...commonAppKitConfig,
    wagmiConfig: commonWagmiConfig,
    adapters: ['wagmi', 'solana', 'bitcoin', 'ton'],
    networks: ConstantsUtil.AllNetworks,
    features: {
      headless: true
    }
  },
  // ----- Wagmi Variants ------------------------------
  wagmi: {
    ...commonAppKitConfig,
    adapters: ['wagmi'],
    wagmiConfig: commonWagmiConfig,
    networks: ConstantsUtil.EvmNetworks
  },
  'wagmi-all': {
    ...commonAppKitConfig,
    adapters: ['wagmi'],
    wagmiConfig: commonWagmiConfig,
    networks: ConstantsUtil.EvmNetworks,
    siweConfig
  },
  'wagmi-no-email': {
    ...commonAppKitConfig,
    adapters: ['wagmi'],
    wagmiConfig: commonWagmiConfig,
    networks: ConstantsUtil.EvmNetworks,
    features: {
      email: false,
      legalCheckbox: true,
      socials: []
    }
  },
  'wagmi-no-socials': {
    ...commonAppKitConfig,
    adapters: ['wagmi'],
    wagmiConfig: commonWagmiConfig,
    networks: ConstantsUtil.EvmNetworks,
    features: {
      socials: [],
      emailShowWallets: false
    }
  },
  'wagmi-debug-mode': {
    ...commonAppKitConfig,
    adapters: ['wagmi'],
    wagmiConfig: commonWagmiConfig,
    networks: ConstantsUtil.EvmNetworks,
    debug: true
  },

  // ----- Wagmi Custom Variants ------------------------------
  'wagmi-verify-domain-mismatch': {
    ...commonAppKitConfig,
    adapters: ['wagmi'],
    wagmiConfig: commonWagmiConfig,
    networks: ConstantsUtil.EvmNetworks
  },
  'wagmi-verify-evil': {
    ...commonAppKitConfig,
    adapters: ['wagmi'],
    wagmiConfig: commonWagmiConfig,
    networks: ConstantsUtil.EvmNetworks,
    // Special project ID with https://malicious-app-verify-simulation.vercel.app/ as the verified domain and this domain is marked as a scam
    projectId: '9d176efa3150a1df0a76c8c138b6b657'
  },
  'wagmi-verify-valid': {
    ...commonAppKitConfig,
    adapters: ['wagmi'],
    wagmiConfig: commonWagmiConfig,
    networks: ConstantsUtil.EvmNetworks,
    // Special project ID with verify enabled on localhost
    projectId: 'e4eae1aad4503db9966a04fd045a7e4d'
  },
  'wagmi-permission-async': {
    ...commonAppKitConfig,
    adapters: ['wagmi'],
    wagmiConfig: commonWagmiConfig,
    networks: ConstantsUtil.EvmNetworks,
    features: {
      smartSessions: true,
      emailShowWallets: false,
      socials: []
    }
  },
  'wagmi-permission-sync': {
    ...commonAppKitConfig,
    adapters: ['wagmi'],
    wagmiConfig: commonWagmiConfig,
    networks: ConstantsUtil.EvmNetworks,
    features: {
      smartSessions: true,
      emailShowWallets: false,
      socials: []
    }
  },
  'wagmi-no-ssr': {
    ...commonAppKitConfig,
    wagmiConfig: { ...commonWagmiConfig, ssr: false },
    adapters: ['wagmi'],
    networks: ConstantsUtil.EvmNetworks
  },

  // ----- Ethers5 Variants ------------------------------
  ethers5: {
    ...commonAppKitConfig,
    adapters: ['ethers5'],
    networks: ConstantsUtil.EvmNetworks
  },
  'ethers5-all': {
    ...commonAppKitConfig,
    adapters: ['ethers5'],
    networks: ConstantsUtil.EvmNetworks,
    siweConfig
  },
  'ethers5-no-email': {
    ...commonAppKitConfig,
    adapters: ['ethers5'],
    networks: ConstantsUtil.EvmNetworks,
    features: {
      legalCheckbox: true,
      email: false,
      socials: []
    }
  },
  'ethers5-no-socials': {
    ...commonAppKitConfig,
    adapters: ['ethers5'],
    networks: ConstantsUtil.EvmNetworks,
    features: {
      emailShowWallets: false,
      socials: []
    }
  },
  'ethers5-debug-mode': {
    ...commonAppKitConfig,
    adapters: ['ethers5'],
    networks: ConstantsUtil.EvmNetworks,
    debug: true
  },

  // ----- Ethers Variants ------------------------------
  ethers: {
    ...commonAppKitConfig,
    adapters: ['ethers'],
    networks: ConstantsUtil.EvmNetworks
  },
  'ethers-all': {
    ...commonAppKitConfig,
    adapters: ['ethers'],
    networks: ConstantsUtil.EvmNetworks,
    siweConfig
  },
  'ethers-no-email': {
    ...commonAppKitConfig,
    adapters: ['ethers'],
    networks: ConstantsUtil.EvmNetworks,
    features: {
      legalCheckbox: true,
      email: false,
      socials: []
    }
  },
  'ethers-no-socials': {
    ...commonAppKitConfig,
    adapters: ['ethers'],
    networks: ConstantsUtil.EvmNetworks,
    features: {
      emailShowWallets: false,
      socials: []
    }
  },
  'ethers-debug-mode': {
    ...commonAppKitConfig,
    adapters: ['ethers'],
    networks: ConstantsUtil.EvmNetworks,
    debug: true
  },

  // ----- Ethers Custom Variants ------------------------------
  'ethers-verify-domain-mismatch': {
    ...commonAppKitConfig,
    adapters: ['ethers'],
    networks: ConstantsUtil.EvmNetworks
  },
  'ethers-verify-evil': {
    ...commonAppKitConfig,
    adapters: ['ethers'],
    networks: ConstantsUtil.EvmNetworks,
    // Special project ID with https://malicious-app-verify-simulation.vercel.app/ as the verified domain and this domain is marked as a scam
    projectId: '9d176efa3150a1df0a76c8c138b6b657'
  },
  'ethers-verify-valid': {
    ...commonAppKitConfig,
    adapters: ['ethers'],
    networks: ConstantsUtil.EvmNetworks,
    // Special project ID with verify enabled on localhost
    projectId: 'e4eae1aad4503db9966a04fd045a7e4d'
  },

  // ----- Bitcoin Variants ------------------------------
  bitcoin: {
    ...commonAppKitConfig,
    adapters: ['bitcoin'],
    networks: ConstantsUtil.BitcoinNetworks
  },

  // ----- TON Variants ------------------------------
  ton: {
    ...commonAppKitConfig,
    adapters: ['ton'],
    networks: ConstantsUtil.TonNetworks
  },

  // ----- Solana Variants ------------------------------
  solana: {
    ...commonAppKitConfig,
    adapters: ['solana'],
    networks: ConstantsUtil.SolanaNetworks
  },
  'solana-all': {
    ...commonAppKitConfig,
    adapters: ['solana'],
    networks: ConstantsUtil.SolanaNetworks,
    siweConfig
  },
  'solana-no-email': {
    ...commonAppKitConfig,
    adapters: ['solana'],
    networks: ConstantsUtil.SolanaNetworks,
    features: {
      legalCheckbox: true,
      email: false,
      socials: []
    }
  },
  'solana-no-socials': {
    ...commonAppKitConfig,
    adapters: ['solana'],
    networks: ConstantsUtil.SolanaNetworks,
    features: {
      emailShowWallets: false,
      socials: []
    }
  },
  'solana-debug-mode': {
    ...commonAppKitConfig,
    adapters: ['solana'],
    networks: ConstantsUtil.SolanaNetworks,
    debug: true
  },
  'solana-wallet-button': {
    ...commonAppKitConfig,
    adapters: ['solana'],
    networks: ConstantsUtil.SolanaNetworks
  },

  // ----- Multichain Variants ------------------------------
  'multichain-all': {
    ...commonAppKitConfig,
    wagmiConfig: commonWagmiConfig,
    adapters: ['wagmi', 'solana', 'bitcoin', 'ton'],
    networks: ConstantsUtil.AllNetworks
  },
  'multichain-no-adapters': {
    ...commonAppKitConfig,
    adapters: [],
    networks: ConstantsUtil.AllNetworks,
    enableMobileFullScreen: true
  },
  'multichain-wagmi-solana': {
    ...commonAppKitConfig,
    wagmiConfig: commonWagmiConfig,
    adapters: ['wagmi', 'solana'],
    networks: [...ConstantsUtil.EvmNetworks, ...ConstantsUtil.SolanaNetworks]
  },
  'multichain-wagmi-solana-siwe': {
    ...commonAppKitConfig,
    wagmiConfig: commonWagmiConfig,
    adapters: ['wagmi', 'solana'],
    networks: [...ConstantsUtil.EvmNetworks, ...ConstantsUtil.SolanaNetworks],
    siweConfig
  },
  'multichain-wagmi-bitcoin': {
    ...commonAppKitConfig,
    wagmiConfig: commonWagmiConfig,
    adapters: ['wagmi', 'bitcoin'],
    networks: [...ConstantsUtil.EvmNetworks, ...ConstantsUtil.BitcoinNetworks]
  },
  'multichain-ethers-solana': {
    ...commonAppKitConfig,
    adapters: ['ethers', 'solana'],
    networks: [...ConstantsUtil.EvmNetworks, ...ConstantsUtil.SolanaNetworks]
  },
  'multichain-ethers-solana-siwe': {
    ...commonAppKitConfig,
    adapters: ['ethers', 'solana'],
    networks: [...ConstantsUtil.EvmNetworks, ...ConstantsUtil.SolanaNetworks],
    siweConfig
  },
  'multichain-ethers5-solana': {
    ...commonAppKitConfig,
    adapters: ['ethers5', 'solana'],
    networks: [...ConstantsUtil.EvmNetworks, ...ConstantsUtil.SolanaNetworks]
  },
  'multichain-ethers5-solana-siwe': {
    ...commonAppKitConfig,
    adapters: ['ethers5', 'solana'],
    networks: [...ConstantsUtil.EvmNetworks, ...ConstantsUtil.SolanaNetworks],
    siweConfig
  },
  'multichain-no-custom-wallets': {
    ...commonAppKitConfig,
    wagmiConfig: commonWagmiConfig,
    adapters: ['wagmi', 'solana', 'bitcoin', 'ton'],
    networks: ConstantsUtil.AllNetworks,
    customWallets: []
  },

  // ----- Custom Variants ------------------------------
  'siwx-default': {
    ...commonAppKitConfig,
    adapters: ['ethers', 'solana', 'bitcoin'],
    networks: ConstantsUtil.AllNetworks,
    siwx: new DefaultSIWX()
  },
  'reown-authentication': {
    ...commonAppKitConfig,
    adapters: ['ethers', 'solana', 'bitcoin'],
    networks: ConstantsUtil.AllNetworks,
    siwx: new ReownAuthentication(),
    siwxReown: true
  },
  'pay-default': {
    ...commonAppKitConfig,
    wagmiConfig: commonWagmiConfig,
    adapters: ['wagmi', 'solana', 'bitcoin'],
    networks: ConstantsUtil.AllNetworks,
    features: { pay: true }
  },
  'universal-links': {
    ...commonAppKitConfig,
    wagmiConfig: commonWagmiConfig,
    adapters: ['wagmi'],
    networks: ConstantsUtil.EvmNetworks,
    experimental_preferUniversalLinks: true
  },
  external: {
    ...commonAppKitConfig,
    wagmiConfig: { ...commonWagmiConfig, connectors },
    adapters: ['wagmi'],
    networks: ConstantsUtil.EvmNetworks,
    featuredWalletIds: ['fd20dc426fb37566d803205b19bbc1d4096b248ac04548e3cfb6b3a38bd033aa']
  },

  // ----- Flags -------------------------
  'flag-custom-rpc-url': {
    ...commonAppKitConfig,
    adapters: ['wagmi'],
    wagmiConfig: commonWagmiConfig,
    networks: ConstantsUtil.EvmNetworks,
    customRpcUrls
  },
  'flag-default-account-types-eoa': {
    ...commonAppKitConfig,
    adapters: ['wagmi'],
    wagmiConfig: commonWagmiConfig,
    networks: ConstantsUtil.EvmNetworks,
    defaultAccountTypes: {
      eip155: 'eoa'
    }
  },
  'flag-default-account-types-sa': {
    ...commonAppKitConfig,
    adapters: ['wagmi'],
    wagmiConfig: commonWagmiConfig,
    networks: ConstantsUtil.EvmNetworks,
    defaultAccountTypes: {
      eip155: 'smartAccount'
    }
  },
  'flag-enable-reconnect-ethers': {
    ...commonAppKitConfig,
    adapters: ['ethers', 'solana', 'bitcoin'],
    networks: ConstantsUtil.AllNetworks,
    enableReconnect: false
  },
  'flag-enable-reconnect-ethers5': {
    ...commonAppKitConfig,
    adapters: ['ethers5', 'solana', 'bitcoin'],
    networks: ConstantsUtil.AllNetworks,
    enableReconnect: false
  },
  'flag-enable-reconnect-wagmi': {
    ...commonAppKitConfig,
    wagmiConfig: commonWagmiConfig,
    adapters: ['wagmi', 'solana', 'bitcoin'],
    networks: ConstantsUtil.AllNetworks,
    enableReconnect: false
  },
  'flag-exclude-wallet-ids': {
    ...commonAppKitConfig,
    adapters: ['wagmi'],
    wagmiConfig: commonWagmiConfig,
    networks: ConstantsUtil.EvmNetworks,
    excludeWalletIds: ['2bd8c14e035c2d48f184aaa168559e86b0e3433228d3c4075900a221785019b0']
  }

  // ----- Core -------------------------
} as AppKitConfigObject

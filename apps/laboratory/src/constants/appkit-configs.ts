import type { CreateConfigParameters } from 'wagmi'

import type { CreateAppKit } from '@reown/appkit'
import type { AppKitNetwork, CustomRpcUrlMap } from '@reown/appkit-common'

import { ConstantsUtil } from '@/src/utils/ConstantsUtil'
import { siweConfig } from '@/src/utils/SiweUtils'

export type Adapter = 'wagmi' | 'ethers' | 'ethers5' | 'solana' | 'bitcoin'
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
  }
>

const commonAppKitConfig = {
  termsConditionsUrl: 'https://reown.com/terms-of-service',
  privacyPolicyUrl: 'https://reown.com/privacy-policy',
  customWallets: ConstantsUtil.CustomWallets
}
const commonWagmiConfig = {
  ssr: true,
  networks: ConstantsUtil.EvmNetworks,
  projectId: ConstantsUtil.ProjectId
} as WagmiConfig

export const appKitConfigs = {
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

  // ----- Bitcoin Variants ------------------------------
  bitcoin: {
    ...commonAppKitConfig,
    adapters: ['bitcoin'],
    networks: ConstantsUtil.BitcoinNetworks
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
    adapters: ['wagmi', 'solana', 'bitcoin'],
    networks: ConstantsUtil.AllNetworks
  },
  'multichain-no-adapters': {
    ...commonAppKitConfig,
    adapters: [],
    networks: ConstantsUtil.AllNetworks
  },
  'multichain-wagmi-solana': {
    ...commonAppKitConfig,
    adapters: ['wagmi', 'solana'],
    networks: [...ConstantsUtil.EvmNetworks, ...ConstantsUtil.SolanaNetworks]
  },
  'multichain-wagmi-solana-siwe': {
    ...commonAppKitConfig,
    adapters: ['wagmi', 'solana'],
    networks: [...ConstantsUtil.EvmNetworks, ...ConstantsUtil.SolanaNetworks],
    siweConfig
  },
  'multichain-wagmi-bitcoin': {
    ...commonAppKitConfig,
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
  }
} as AppKitConfigObject

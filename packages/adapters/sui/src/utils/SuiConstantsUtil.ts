import { type CaipNetwork } from '@reown/appkit-common'

export const SuiConstantsUtil = {
  CHAIN: 'sui',
  SUI_MAINNET_CHAIN: 'sui:mainnet' as const,
  SUI_TESTNET_CHAIN: 'sui:testnet' as const,
  SUI_DEVNET_CHAIN: 'sui:devnet' as const
}

export const SuiNetworks: CaipNetwork[] = [
  {
    id: SuiConstantsUtil.SUI_MAINNET_CHAIN,
    name: 'Sui Mainnet',
    rpcUrls: {
      default: {
        http: ['https://fullnode.mainnet.sui.io']
      }
    },
    nativeCurrency: {
      name: 'Sui',
      symbol: 'SUI',
      decimals: 9
    },
    blockExplorers: {
      default: { name: 'SuiScan', url: 'https://suiscan.xyz/mainnet' }
    },
    chainNamespace: SuiConstantsUtil.CHAIN
  },
  {
    id: SuiConstantsUtil.SUI_TESTNET_CHAIN,
    name: 'Sui Testnet',
    rpcUrls: {
      default: {
        http: ['https://fullnode.testnet.sui.io']
      }
    },
    nativeCurrency: {
      name: 'Sui',
      symbol: 'SUI',
      decimals: 9
    },
    blockExplorers: {
      default: { name: 'SuiScan', url: 'https://suiscan.xyz/testnet' }
    },
    chainNamespace: SuiConstantsUtil.CHAIN
  },
  {
    id: SuiConstantsUtil.SUI_DEVNET_CHAIN,
    name: 'Sui Devnet',
    rpcUrls: {
      default: {
        http: ['https://fullnode.devnet.sui.io']
      }
    },
    nativeCurrency: {
      name: 'Sui',
      symbol: 'SUI',
      decimals: 9
    },
    blockExplorers: {
      default: { name: 'SuiScan', url: 'https://suiscan.xyz/devnet' }
    },
    chainNamespace: SuiConstantsUtil.CHAIN
  }
]

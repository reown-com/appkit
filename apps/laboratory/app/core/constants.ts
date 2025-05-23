import type { InferredCaipNetwork } from '@reown/appkit-common'
import type { AppKitNetwork } from '@reown/appkit/networks'
import { bitcoin, mainnet, polygon, solana } from '@reown/appkit/networks'

import { ConstantsUtil } from '@/src/utils/ConstantsUtil'

const sui: InferredCaipNetwork = {
  id: 784,
  chainNamespace: 'sui' as const,
  caipNetworkId: 'sui:784',
  name: 'Sui',
  nativeCurrency: { name: 'SUI', symbol: 'SUI', decimals: 9 },
  rpcUrls: { default: { http: ['https://fullnode.mainnet.sui.io:443'] } }
}

// Constants
export const PROJECT_ID = ConstantsUtil.ProjectId
export const OPTIONAL_NAMESPACES = {
  eip155: {
    methods: [
      'eth_sendTransaction',
      'eth_signTransaction',
      'eth_sign',
      'personal_sign',
      'eth_signTypedData',
      'wallet_switchEthereumChain',
      'wallet_addEthereumChain'
    ],
    chains: ['eip155:1', 'eip155:137'],
    events: ['chainChanged', 'accountsChanged']
  },
  solana: {
    methods: ['solana_signMessage'],
    chains: [solana.caipNetworkId],
    events: ['chainChanged', 'accountsChanged']
  },
  bip122: {
    methods: ['signMessage'],
    chains: [bitcoin.caipNetworkId],
    events: ['chainChanged', 'accountsChanged']
  },
  sui: {
    methods: ['sui_signTransaction', 'sui_signAndExecuteTransaction'],
    chains: [sui.caipNetworkId],
    events: ['chainChanged', 'accountsChanged']
  }
}

export const networks = [mainnet, polygon, solana, bitcoin, sui] as [
  AppKitNetwork,
  ...AppKitNetwork[]
]

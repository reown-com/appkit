import type { AppKitNetwork } from '@reown/appkit/networks'
import { bitcoin, mainnet, polygon, solana } from '@reown/appkit/networks'

import { ConstantsUtil } from '@/src/utils/ConstantsUtil'

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
  }
}

export const networks = [mainnet, polygon, solana, bitcoin] as [AppKitNetwork, ...AppKitNetwork[]]

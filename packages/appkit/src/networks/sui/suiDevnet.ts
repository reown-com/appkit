import { defineChain } from '../utils.js'

export const suiDevnet = defineChain({
  id: 'devnet',
  name: 'Sui Devnet',
  network: 'sui-devnet',
  nativeCurrency: { name: 'Sui Devnet', symbol: 'SUI', decimals: 9 },
  rpcUrls: {
    default: { http: ['https://fullnode.devnet.sui.io:443'] }
  },
  blockExplorers: { default: { name: 'Suiscan', url: 'https://suiscan.xyz/devnet' } },
  testnet: false,
  chainNamespace: 'sui',
  caipNetworkId: 'sui:devnet'
})

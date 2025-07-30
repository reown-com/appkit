import { defineChain } from '../utils.js'

export const suiDestnet = defineChain({
  id: 'testnet',
  name: 'Sui Testnet',
  network: 'sui-testnet',
  nativeCurrency: { name: 'Sui Testnet', symbol: 'SUI', decimals: 9 },
  rpcUrls: {
    default: { http: ['https://fullnode.devnet.sui.io:443'] }
  },
  blockExplorers: { default: { name: 'Suiscan', url: 'https://suiscan.xyz/testnet' } },
  testnet: false,
  chainNamespace: 'sui',
  caipNetworkId: 'sui:testnet'
})

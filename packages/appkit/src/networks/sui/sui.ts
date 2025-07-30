import { defineChain } from '../utils.js'

export const sui = defineChain({
  id: 'mainnet',
  name: 'Sui',
  network: 'sui-mainnet',
  nativeCurrency: { name: 'Sui', symbol: 'SUI', decimals: 9 },
  rpcUrls: {
    default: { http: ['https://fullnode.mainnet.sui.io:443'] }
  },
  blockExplorers: { default: { name: 'Suiscan', url: 'https://suiscan.xyz/mainnet' } },
  testnet: false,
  chainNamespace: 'sui',
  caipNetworkId: 'sui:mainnet'
})

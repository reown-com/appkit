import { defineChain } from '../utils.js'

export const stellar = defineChain({
  id: 'pubnet',
  name: 'Stellar',
  network: 'stellar-pubnet',
  nativeCurrency: { name: 'Lumens', symbol: 'XLM', decimals: 7 },
  rpcUrls: {
    default: { http: ['https://horizon.stellar.org'] },
    chainDefault: { http: ['https://horizon.stellar.org'] }
  },
  blockExplorers: {
    default: { name: 'Stellar Expert', url: 'https://stellar.expert/explorer/public' }
  },
  testnet: false,
  chainNamespace: 'stellar',
  caipNetworkId: 'stellar:pubnet'
})

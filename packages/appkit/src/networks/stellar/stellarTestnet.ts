import { defineChain } from '../utils.js'

export const stellarTestnet = defineChain({
  id: 'testnet',
  name: 'Stellar Testnet',
  network: 'stellar-testnet',
  nativeCurrency: { name: 'Lumens', symbol: 'XLM', decimals: 7 },
  rpcUrls: {
    default: { http: ['https://horizon-testnet.stellar.org'] },
    chainDefault: { http: ['https://horizon-testnet.stellar.org'] }
  },
  blockExplorers: {
    default: { name: 'Stellar Expert', url: 'https://stellar.expert/explorer/testnet' }
  },
  testnet: true,
  chainNamespace: 'stellar',
  caipNetworkId: 'stellar:testnet'
})

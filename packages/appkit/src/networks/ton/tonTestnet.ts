import { defineChain } from '../utils.js'

export const tonTestnet = defineChain({
  id: 'testnet',
  name: 'TON Testnet',
  network: 'ton-testnet',
  nativeCurrency: { name: 'TON', symbol: 'TON', decimals: 9 },
  rpcUrls: {
    default: { http: ['https://rpc.walletconnect.org/v1'] }
  },
  blockExplorers: { default: { name: 'Tonscan', url: 'https://testnet.tonscan.org' } },
  testnet: true,
  chainNamespace: 'ton',
  caipNetworkId: 'ton:testnet'
})

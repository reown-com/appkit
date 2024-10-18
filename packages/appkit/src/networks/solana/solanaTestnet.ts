import { defineChain } from '../utils.js'

export const solanaTestnet = defineChain({
  id: '4uhcVJyU9pJkvQyS88uRDiswHXSCkY3z',
  name: 'Solana Testnet',
  network: 'solana-testnet',
  nativeCurrency: { name: 'Solana', symbol: 'SOL', decimals: 9 },
  rpcUrls: {
    default: { http: ['https://rpc.walletconnect.org/v1'] }
  },
  blockExplorers: { default: { name: 'Solscan', url: 'https://solscan.io' } },
  testnet: true,
  chainNamespace: 'solana',
  caipNetworkId: 'solana:4uhcVJyU9pJkvQyS88uRDiswHXSCkY3z'
})

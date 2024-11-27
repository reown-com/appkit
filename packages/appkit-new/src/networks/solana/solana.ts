import { defineChain } from '../utils.js'

export const solana = defineChain({
  id: '5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp',
  name: 'Solana',
  network: 'solana-mainnet',
  nativeCurrency: { name: 'Solana', symbol: 'SOL', decimals: 9 },
  rpcUrls: {
    default: { http: ['https://rpc.walletconnect.org/v1'] }
  },
  blockExplorers: { default: { name: 'Solscan', url: 'https://solscan.io' } },
  testnet: false,
  chainNamespace: 'solana',
  caipNetworkId: 'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp',
  deprecatedCaipNetworkId: 'solana:4sGjMW1sUnHzSxGspuhpqLDx6wiyjNtZ'
})

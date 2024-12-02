import { defineChain } from '../utils.js'

export const solanaDevnet = defineChain({
  id: 'EtWTRABZaYq6iMfeYKouRu166VU2xqa1',
  name: 'Solana Devnet',
  network: 'solana-devnet',
  nativeCurrency: { name: 'Solana', symbol: 'SOL', decimals: 9 },
  rpcUrls: {
    default: { http: ['https://rpc.walletconnect.org/v1'] }
  },
  blockExplorers: { default: { name: 'Solscan', url: 'https://solscan.io' } },
  testnet: true,
  chainNamespace: 'solana',
  caipNetworkId: 'solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1',
  deprecatedCaipNetworkId: 'solana:8E9rvCKLFQia2Y35HXjjpWzj8weVo44K'
})

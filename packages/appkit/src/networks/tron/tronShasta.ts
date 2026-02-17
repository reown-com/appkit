import { defineChain } from '../utils.js'

export const tronShastaTestnet = defineChain({
  id: '0x94a9059e',
  name: 'TRON Shasta',
  network: 'tron-shasta',
  nativeCurrency: { name: 'TRX', symbol: 'TRX', decimals: 6 },
  rpcUrls: {
    default: { http: ['https://rpc.walletconnect.org/v1'] }
  },
  blockExplorers: { default: { name: 'Tronscan', url: 'https://shasta.tronscan.org' } },
  testnet: true,
  chainNamespace: 'tron',
  caipNetworkId: 'tron:0x94a9059e'
})

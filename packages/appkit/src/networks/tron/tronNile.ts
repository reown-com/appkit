import { defineChain } from '../utils.js'

export const tronNileTestnet = defineChain({
  id: '0xcd8690dc',
  name: 'TRON Nile',
  network: 'tron-nile',
  nativeCurrency: { name: 'TRX', symbol: 'TRX', decimals: 6 },
  rpcUrls: {
    default: { http: ['https://rpc.walletconnect.org/v1'] }
  },
  blockExplorers: { default: { name: 'Tronscan', url: 'https://nile.tronscan.org' } },
  testnet: true,
  chainNamespace: 'tron',
  caipNetworkId: 'tron:0xcd8690dc'
})

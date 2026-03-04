import { defineChain } from '../utils.js'

export const tronMainnet = defineChain({
  id: '0x2b6653dc',
  name: 'TRON',
  network: 'tron-mainnet',
  nativeCurrency: { name: 'TRX', symbol: 'TRX', decimals: 6 },
  rpcUrls: {
    default: { http: ['https://rpc.walletconnect.org/v1'] }
  },
  blockExplorers: { default: { name: 'Tronscan', url: 'https://tronscan.org' } },
  testnet: false,
  chainNamespace: 'tron',
  caipNetworkId: 'tron:0x2b6653dc'
})

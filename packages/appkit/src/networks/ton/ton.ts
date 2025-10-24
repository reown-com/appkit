import { defineChain } from '../utils.js'

export const ton = defineChain({
  id: '-239',
  name: 'TON',
  network: 'ton-mainnet',
  nativeCurrency: { name: 'TON', symbol: 'TON', decimals: 9 },
  rpcUrls: {
    default: { http: ['https://rpc.walletconnect.org/v1'] }
  },
  blockExplorers: { default: { name: 'Tonscan', url: 'https://tonscan.org' } },
  testnet: false,
  chainNamespace: 'ton',
  caipNetworkId: 'ton:-239'
})

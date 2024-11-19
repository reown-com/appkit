import { defineChain } from './utils.js'

export const bitcoin = defineChain({
  id: 'bitcoin',
  caipNetworkId: 'bip122:000000000019d6689c085ae165831e93',
  chainNamespace: 'bip122',
  name: 'Bitcoin',
  nativeCurrency: {
    name: 'Bitcoin',
    symbol: 'BTC',
    decimals: 8
  },
  rpcUrls: {
    default: { http: ['https://rpc.walletconnect.org/v1'] }
  }
})
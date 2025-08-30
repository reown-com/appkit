import { defineChain } from './utils.js'

export const bitcoin = defineChain({
  id: '000000000019d6689c085ae165831e93',
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

export const bitcoinTestnet = defineChain({
  id: '000000000933ea01ad0ee984209779ba',
  caipNetworkId: 'bip122:000000000933ea01ad0ee984209779ba',
  chainNamespace: 'bip122',
  name: 'Bitcoin Testnet',
  nativeCurrency: {
    name: 'Bitcoin',
    symbol: 'BTC',
    decimals: 8
  },
  rpcUrls: {
    default: { http: ['https://rpc.walletconnect.org/v1'] }
  },
  testnet: true
})

export const bitcoinSignet = defineChain({
  id: '00000008819873e925422c1ff0f99f7c',
  caipNetworkId: 'bip122:00000008819873e925422c1ff0f99f7c',
  chainNamespace: 'bip122',
  name: 'Bitcoin Signet',
  nativeCurrency: {
    name: 'Bitcoin',
    symbol: 'BTC',
    decimals: 8
  },
  rpcUrls: {
    default: { http: ['https://rpc.walletconnect.org/v1'] }
  },
  testnet: true
})

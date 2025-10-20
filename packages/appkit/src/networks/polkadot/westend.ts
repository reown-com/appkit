import { defineChain } from '../utils.js'

export const westend = defineChain({
  id: 'e143f23803ac50e8f6f8e62695d1ce9e',
  name: 'Westend Testnet',
  network: 'westend',
  chainNamespace: 'polkadot',
  caipNetworkId: 'polkadot:e143f23803ac50e8f6f8e62695d1ce9e',
  nativeCurrency: {
    name: 'Westend',
    symbol: 'WND',
    decimals: 12
  },
  rpcUrls: {
    default: {
      http: ['https://westend-rpc.polkadot.io'],
      webSocket: ['wss://westend-rpc.polkadot.io']
    },
    public: {
      http: ['https://westend-rpc.polkadot.io'],
      webSocket: ['wss://westend-rpc.polkadot.io']
    }
  },
  blockExplorers: {
    default: {
      name: 'Subscan',
      url: 'https://westend.subscan.io'
    }
  },
  assets: {
    imageUrl: 'https://app.sacredprotocol.com/assets/polkadot.svg',
    imageId: undefined
  },
  testnet: true
})


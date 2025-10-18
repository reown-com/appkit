import { defineChain } from '../utils.js'

export const polkadot = defineChain({
  id: '91b171bb158e2d3848fa23a9f1c25182',
  name: 'Polkadot',
  network: 'polkadot',
  chainNamespace: 'polkadot',
  caipNetworkId: 'polkadot:91b171bb158e2d3848fa23a9f1c25182',
  nativeCurrency: {
    name: 'Polkadot',
    symbol: 'DOT',
    decimals: 10
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.polkadot.io'],
      webSocket: ['wss://rpc.polkadot.io']
    },
    public: {
      http: ['https://rpc.polkadot.io'],
      webSocket: ['wss://rpc.polkadot.io']
    }
  },
  blockExplorers: {
    default: {
      name: 'Subscan',
      url: 'https://polkadot.subscan.io'
    }
  },
  testnet: false
})

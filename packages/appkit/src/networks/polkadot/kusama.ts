import { defineChain } from '../utils.js'

export const kusama = defineChain({
  id: 'b0a8d493285c2df73290dfb7e61f870f',
  name: 'Kusama',
  network: 'kusama',
  chainNamespace: 'polkadot',
  caipNetworkId: 'polkadot:b0a8d493285c2df73290dfb7e61f870f',
  nativeCurrency: {
    name: 'Kusama',
    symbol: 'KSM',
    decimals: 12
  },
  rpcUrls: {
    default: {
      http: ['https://kusama-rpc.polkadot.io'],
      webSocket: ['wss://kusama-rpc.polkadot.io']
    },
    public: {
      http: ['https://kusama-rpc.polkadot.io'],
      webSocket: ['wss://kusama-rpc.polkadot.io']
    }
  },
  blockExplorers: {
    default: {
      name: 'Subscan',
      url: 'https://kusama.subscan.io'
    }
  },
  testnet: false
})


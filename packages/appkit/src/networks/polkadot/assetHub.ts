import { defineChain } from '../utils.js'

export const assetHub = defineChain({
  id: '68d56f15f85d3136970ec16946040bc1',
  name: 'Polkadot Asset Hub',
  network: 'polkadot-assethub',
  chainNamespace: 'polkadot',
  caipNetworkId: 'polkadot:68d56f15f85d3136970ec16946040bc1',
  nativeCurrency: {
    name: 'Polkadot',
    symbol: 'DOT',
    decimals: 10
  },
  rpcUrls: {
    default: {
      http: ['https://statemint-rpc.polkadot.io'],
      webSocket: ['wss://statemint-rpc.polkadot.io']
    },
    public: {
      http: ['https://statemint-rpc.polkadot.io'],
      webSocket: ['wss://statemint-rpc.polkadot.io']
    }
  },
  blockExplorers: {
    default: {
      name: 'Subscan',
      url: 'https://assethub-polkadot.subscan.io'
    }
  },
  testnet: false
})

import type { CaipNetwork } from '@laughingwhales/appkit-common'

export const POLKADOT_MAINNET: CaipNetwork = {
  id: '91b171bb158e2d3848fa23a9f1c25182',
  name: 'Polkadot',
  chainNamespace: 'polkadot',
  caipNetworkId: 'polkadot:91b171bb158e2d3848fa23a9f1c25182',
  nativeCurrency: { name: 'Polkadot', symbol: 'DOT', decimals: 10 },
  rpcUrls: {
    default: { http: ['https://rpc.polkadot.io'], webSocket: ['wss://rpc.polkadot.io'] },
    public: { http: ['https://rpc.polkadot.io'], webSocket: ['wss://rpc.polkadot.io'] }
  },
  blockExplorers: { default: { name: 'Subscan', url: 'https://polkadot.subscan.io' } }
}

export const POLKADOT_ASSETHUB: CaipNetwork = {
  id: '68d56f15f85d3136970ec16946040bc1',
  name: 'Polkadot Asset Hub',
  chainNamespace: 'polkadot',
  caipNetworkId: 'polkadot:68d56f15f85d3136970ec16946040bc1',
  nativeCurrency: { name: 'Polkadot', symbol: 'DOT', decimals: 10 },
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
  blockExplorers: { default: { name: 'Subscan', url: 'https://assethub-polkadot.subscan.io' } }
}

export const MOCK_NETWORKS: CaipNetwork[] = [POLKADOT_MAINNET, POLKADOT_ASSETHUB]

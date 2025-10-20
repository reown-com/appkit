/**
 * Mock Polkadot network configurations for testing
 */
import type { CaipNetwork } from '@reown/appkit-common'

/**
 * Polkadot Relay Chain (mainnet)
 * Genesis hash: 0x91b171bb158e2d3848fa23a9f1c25182fb114c5ba58d3d708ae8e2f8f691d8f0
 */
export const POLKADOT_MAINNET: CaipNetwork = {
  id: '91b171bb158e2d3848fa23a9f1c25182',
  name: 'Polkadot',
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
  }
}

/**
 * Kusama Relay Chain
 * Genesis hash: 0xb0a8d493285c2df73290dfb7e61f870f17b41801197a149ca93654499ea3dafe
 */
export const KUSAMA_NETWORK: CaipNetwork = {
  id: 'b0a8d493285c2df73290dfb7e61f870f',
  name: 'Kusama',
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
  }
}

/**
 * Westend Testnet
 * Genesis hash: 0xe143f23803ac50e8f6f8e62695d1ce9e4e1d68aa36c1cd2cfd15340213f3423e
 */
export const WESTEND_TESTNET: CaipNetwork = {
  id: 'e143f23803ac50e8f6f8e62695d1ce9e',
  name: 'Westend Testnet',
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
  }
}

export const MOCK_NETWORKS = [POLKADOT_MAINNET, KUSAMA_NETWORK, WESTEND_TESTNET]


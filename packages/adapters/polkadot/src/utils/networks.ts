/**
 * Example Polkadot network definitions
 * 
 * These demonstrate how to define Polkadot/Substrate networks for AppKit.
 * Use the genesis hash (first 32 hex chars, no 0x) as the CAIP-2 chain reference.
 * 
 * @see https://namespaces.chainagnostic.org/polkadot/caip2
 */

import type { CaipNetwork } from '@reown/appkit-common'

/**
 * Polkadot Relay Chain (mainnet)
 * Genesis hash: 0x91b171bb158e2d3848fa23a9f1c25182fb114c5ba58d3d708ae8e2f8f691d8f0
 */
export const polkadotRelay: CaipNetwork = {
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
 * Polkadot Asset Hub (mainnet, formerly Statemint)
 * Genesis hash: 0x68d56f15f85d3136970ec16946040bc1752654e906147f7e43e9d539d7c3de2f
 */
export const assetHub: CaipNetwork = {
  id: '68d56f15f85d3136970ec16946040bc1',
  name: 'Polkadot Asset Hub',
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
  }
}

/**
 * Kusama Relay Chain
 * Genesis hash: 0xb0a8d493285c2df73290dfb7e61f870f17b41801197a149ca93654499ea3dafe
 */
export const kusamaRelay: CaipNetwork = {
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
 * Westend Testnet (Relay Chain)
 * Genesis hash: 0xe143f23803ac50e8f6f8e62695d1ce9e4e1d68aa36c1cd2cfd15340213f3423e
 */
export const westendTestnet: CaipNetwork = {
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

/**
 * All example networks
 */
export const polkadotNetworks = [polkadotRelay, assetHub, kusamaRelay, westendTestnet] as const

/**
 * Default network (Polkadot Relay Chain)
 */
export const defaultPolkadotNetwork = polkadotRelay


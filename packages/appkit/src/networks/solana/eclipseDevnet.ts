import { defineChain } from '../utils.js'

export const eclipseDevnet = defineChain({
  id: 'eclipse-devnet',
  name: 'Eclipse Devnet',
  network: 'eclipse-devnet',
  nativeCurrency: { name: 'Ethereum', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://staging-rpc.dev2.eclipsenetwork.xyz'] }
  },
  blockExplorers: {
    default: { name: 'EclipseScan', url: 'https://eclipsescan.xyz/?cluster=devnet' }
  },
  testnet: false,
  chainNamespace: 'solana',
  caipNetworkId: 'solana:eclipse-devnet'
})

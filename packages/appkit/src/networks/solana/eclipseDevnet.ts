import { defineChain } from '../utils.js'

export const eclipseDevnet = defineChain({
  id: '8axJLKAqQU9oyULRunGrZTLDEXhn17VW',
  name: 'Eclipse Devnet',
  network: 'eclipse-devnet',
  nativeCurrency: { name: 'Ethereum', symbol: 'ETH', decimals: 9 },
  rpcUrls: {
    default: { http: ['https://staging-rpc.dev2.eclipsenetwork.xyz'] }
  },
  blockExplorers: {
    default: { name: 'Eclipsescan', url: 'https://eclipsescan.xyz/?cluster=devnet' }
  },
  testnet: true,
  chainNamespace: 'solana',
  caipNetworkId: 'solana:8axJLKAqQU9oyULRunGrZTLDEXhn17VW'
})

import { defineChain } from '../utils.js'

export const eclipseTestnet = defineChain({
  id: 'CX4huckiV9QNAkKNVKi5Tj8nxzBive5k',
  name: 'Eclipse Testnet',
  network: 'eclipse-testnet',
  nativeCurrency: { name: 'Ethereum', symbol: 'ETH', decimals: 9 },
  rpcUrls: {
    default: { http: ['https://testnet.dev2.eclipsenetwork.xyz'] }
  },
  blockExplorers: {
    default: { name: 'Eclipsescan', url: 'https://eclipsescan.xyz/?cluster=testnet' }
  },
  testnet: true,
  chainNamespace: 'solana',
  caipNetworkId: 'solana:CX4huckiV9QNAkKNVKi5Tj8nxzBive5k'
})

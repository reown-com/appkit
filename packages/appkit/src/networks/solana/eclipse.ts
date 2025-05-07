import { defineChain } from '../utils.js'

export const eclipse = defineChain({
  id: 'EAQLJCV2mh23BsK2P9oYpV5CHVLDNHTx',
  name: 'Eclipse',
  network: 'eclipse-mainnet',
  nativeCurrency: { name: 'Eclipse', symbol: 'ETH', decimals: 9 },
  rpcUrls: {
    default: { http: ['https://eclipse.helius-rpc.com'] }
  },
  blockExplorers: { default: { name: 'Eclipsescan', url: 'https://eclipsescan.xyz/' } },
  testnet: false,
  chainNamespace: 'solana',
  caipNetworkId: 'solana:EAQLJCV2mh23BsK2P9oYpV5CHVLDNHTx'
})

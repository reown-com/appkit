import type { Chain } from '@wagmi/core'

export const avalanche: Chain = {
  id: 43_114,
  name: 'Avalanche C-Chain',
  network: 'avalanche',
  nativeCurrency: {
    decimals: 18,
    name: 'Avalanche',
    symbol: 'AVAX'
  },
  rpcUrls: {
    default: 'https://api.avax.network/ext/bc/C/rpc'
  },
  blockExplorers: {
    default: { name: 'SnowTrace', url: 'https://snowtrace.io' }
  },
  testnet: false
}

export const binanceSmartChain: Chain = {
  id: 56,
  name: 'Binance Smart Chain',
  network: 'binanceSmartChain',
  nativeCurrency: {
    decimals: 18,
    name: 'Binance',
    symbol: 'BNB'
  },
  rpcUrls: {
    default: 'https://bsc-dataseed.binance.org'
  },
  blockExplorers: {
    default: { name: 'BSC Scan', url: 'https://bscscan.com' }
  },
  testnet: false
}

export const fantom: Chain = {
  id: 250,
  name: 'Fantom Opera',
  network: 'fantomOpera',
  nativeCurrency: {
    decimals: 18,
    name: 'Fantom',
    symbol: 'FTM'
  },
  rpcUrls: {
    default: 'https://rpc.ankr.com/fantom'
  },
  blockExplorers: {
    default: { name: 'FTM Scan', url: 'https://ftmscan.com' }
  },
  testnet: false
}

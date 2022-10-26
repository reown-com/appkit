import type { Chain } from '@wagmi/core'

// -- Avalanche ------------------------------------------------------- //
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

export const avalancheFuji: Chain = {
  id: 43_113,
  name: 'Avalanche FUJI C-Chain',
  network: 'avalancheFuji',
  nativeCurrency: {
    decimals: 18,
    name: 'Avalanche',
    symbol: 'AVAX'
  },
  rpcUrls: {
    default: 'https://api.avax-test.network/ext/bc/C/rpc'
  },
  blockExplorers: {
    default: { name: 'SnowTrace Testnet', url: 'https://testnet.snowtrace.io' }
  },
  testnet: true
}

// -- Binance --------------------------------------------------------- //
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

export const binanceSmartChainTestnet: Chain = {
  id: 97,
  name: 'Binance Smart Chain Testnet',
  network: 'binanceSmartChainTestnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Binance',
    symbol: 'BNB'
  },
  rpcUrls: {
    default: 'https://data-seed-prebsc-1-s1.binance.org:8545'
  },
  blockExplorers: {
    default: { name: 'BSC Scan testnet', url: 'https://testnet.bscscan.com' }
  },
  testnet: true
}

// -- Fantom ---------------------------------------------------------- //
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

export const fantomTestnet: Chain = {
  id: 4_002,
  name: 'Fantom Testnet',
  network: 'fantomTestnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Fantom',
    symbol: 'FTM'
  },
  rpcUrls: {
    default: 'https://rpc.testnet.fantom.network'
  },
  blockExplorers: {
    default: { name: 'FTM Scan Testnet', url: 'https://testnet.ftmscan.com' }
  },
  testnet: true
}


// -- KCC ---------------------------------------------------------- //
export const kcc: Chain = {
  id: 321,
  name: "KCC Mainnet",
  network: "KCC",
  nativeCurrency: {
    name: "KuCoin Shares",
    symbol: "KCS",
    decimals: 18,
  },
  rpcUrls: {
    default: "https://rpc-mainnet.kcc.network",
  },
  blockExplorers: {
    default: {
      name: "KCC explorer",
      url: "https://explorer.kcc.io/en",
    },
  },
  testnet: false,
}

export const kccTestnet: Chain = {
  id: 322,
  name: 'KCC Testnet',
  network: 'kccTestnet',
  nativeCurrency: {
    name: "KuCoin Shares",
    symbol: "KCS",
    decimals: 18,
  },
  rpcUrls: {
    default: 'https://rpc-testnet.kcc.network'
  },
  blockExplorers: {
    default: { name: 'KCC Scan Testnet', url: 'https://scan-testnet.kcc.network' }
  },
  testnet: true
}

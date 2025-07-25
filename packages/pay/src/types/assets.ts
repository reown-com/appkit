import type { PaymentAsset } from '../types/options.js'

export const baseETH: PaymentAsset = {
  network: 'eip155:8453',
  asset: 'native',
  metadata: {
    name: 'Ethereum',
    symbol: 'ETH',
    decimals: 18
  }
}

export const baseUSDC: PaymentAsset = {
  network: 'eip155:8453',
  asset: '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913',
  metadata: {
    name: 'USD Coin',
    symbol: 'USDC',
    decimals: 6
  }
}

export const baseSepoliaETH: PaymentAsset = {
  network: 'eip155:84532',
  asset: 'native',
  metadata: {
    name: 'Ethereum',
    symbol: 'ETH',
    decimals: 18
  }
}

export const ethereumUSDC: PaymentAsset = {
  network: 'eip155:1',
  asset: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
  metadata: {
    name: 'USD Coin',
    symbol: 'USDC',
    decimals: 6
  }
}

export const optimismUSDC: PaymentAsset = {
  network: 'eip155:10',
  asset: '0x0b2c639c533813f4aa9d7837caf62653d097ff85',
  metadata: {
    name: 'USD Coin',
    symbol: 'USDC',
    decimals: 6
  }
}

export const arbitrumUSDC: PaymentAsset = {
  network: 'eip155:42161',
  asset: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
  metadata: {
    name: 'USD Coin',
    symbol: 'USDC',
    decimals: 6
  }
}

export const polygonUSDC: PaymentAsset = {
  network: 'eip155:137',
  asset: '0x3c499c542cef5e3811e1192ce70d8cc03d5c3359',
  metadata: {
    name: 'USD Coin',
    symbol: 'USDC',
    decimals: 6
  }
}

export const solanaUSDC: PaymentAsset = {
  network: 'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp',
  asset: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
  metadata: {
    name: 'USD Coin',
    symbol: 'USDC',
    decimals: 6
  }
}

export const ethereumUSDT: PaymentAsset = {
  network: 'eip155:1',
  asset: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
  metadata: {
    name: 'Tether USD',
    symbol: 'USDT',
    decimals: 6
  }
}

export const optimismUSDT: PaymentAsset = {
  network: 'eip155:10',
  asset: '0x94b008aA00579c1307B0EF2c499aD98a8ce58e58',
  metadata: {
    name: 'Tether USD',
    symbol: 'USDT',
    decimals: 6
  }
}

export const arbitrumUSDT: PaymentAsset = {
  network: 'eip155:42161',
  asset: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9',
  metadata: {
    name: 'Tether USD',
    symbol: 'USDT',
    decimals: 6
  }
}

export const polygonUSDT: PaymentAsset = {
  network: 'eip155:137',
  asset: '0xc2132d05d31c914a87c6611c10748aeb04b58e8f',
  metadata: {
    name: 'Tether USD',
    symbol: 'USDT',
    decimals: 6
  }
}

export const solanaUSDT: PaymentAsset = {
  network: 'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp',
  asset: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
  metadata: {
    name: 'Tether USD',
    symbol: 'USDT',
    decimals: 6
  }
}

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

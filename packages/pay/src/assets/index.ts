// -- ASsets ---------------------------------------------------------------
import type { PaymentAsset } from '../types/options'

export const BaseETH: PaymentAsset = {
  network: 'eip155:8453', // Base Mainnet
  asset: 'native', // Or USDC: '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913'
  metadata: {
      name: 'Ethereum', // Or 'USD Coin'
      symbol: 'ETH',    // Or 'USDC'
      decimals: 18      // Or 6 for USDC
  }
};

export const BaseUSDC: PaymentAsset = {
  network: 'eip155:8453', // Base Mainnet
  asset: '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913',
  metadata: {
      name: 'USD Coin',
      symbol: 'USDC',
      decimals: 6
  }
};

export const BaseSepoliaETH: PaymentAsset = {
  network: 'eip155:84532',
  asset: 'native',
  metadata: {
    name: 'Ethereum',
    symbol: 'ETH',
    decimals: 18
  }
}



import type { CaipNetworkNew } from '@reown/appkit-common'
import type { Assign, Prettify, ChainFormatters } from 'viem'

import type { ChainNamespace } from '@reown/appkit-common'

export * from 'viem/chains'

export function getBlockchainApiRpcUrl(chainId: number | string, namespace: ChainNamespace) {
  return `https://rpc.walletconnect.org/v1/?chainId=${namespace}:${chainId}`
}

export function defineChain<
  formatters extends ChainFormatters,
  const chain extends CaipNetworkNew<formatters>
>(chain: chain): Prettify<Assign<CaipNetworkNew<undefined>, chain>> {
  return {
    formatters: undefined,
    fees: undefined,
    serializers: undefined,
    ...chain
  } as Assign<CaipNetworkNew<undefined>, chain>
}

export const solana = defineChain({
  id: '5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp',
  name: 'Solana',
  network: 'solana-mainnet',
  nativeCurrency: { name: 'Solana', symbol: 'SOL', decimals: 9 },
  rpcUrls: {
    default: { http: [getBlockchainApiRpcUrl('5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp', 'solana')] }
  },
  blockExplorers: { default: { name: 'Solscan', url: 'https://solscan.io' } },
  testnet: false,
  chainNamespace: 'solana',
  caipNetworkId: 'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp'
})

export const solanaTestnet = defineChain({
  id: '4uhcVJyU9pJkvQyS88uRDiswHXSCkY3z',
  name: 'Solana Testnet',
  network: 'solana-testnet',
  nativeCurrency: { name: 'Solana', symbol: 'SOL', decimals: 9 },
  rpcUrls: {
    default: { http: [getBlockchainApiRpcUrl('4uhcVJyU9pJkvQyS88uRDiswHXSCkY3z', 'solana')] }
  },
  blockExplorers: { default: { name: 'Solscan', url: 'https://solscan.io' } },
  testnet: true,
  chainNamespace: 'solana',
  caipNetworkId: 'solana:4uhcVJyU9pJkvQyS88uRDiswHXSCkY3z'
})

export const solanaDevnet = defineChain({
  id: 'EtWTRABZaYq6iMfeYKouRu166VU2xqa1',
  name: 'Solana Devnet',
  network: 'solana-devnet',
  nativeCurrency: { name: 'Solana', symbol: 'SOL', decimals: 9 },
  rpcUrls: {
    default: { http: [getBlockchainApiRpcUrl('EtWTRABZaYq6iMfeYKouRu166VU2xqa1', 'solana')] }
  },
  blockExplorers: { default: { name: 'Solscan', url: 'https://solscan.io' } },
  testnet: true,
  chainNamespace: 'solana',
  caipNetworkId: 'solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1'
})

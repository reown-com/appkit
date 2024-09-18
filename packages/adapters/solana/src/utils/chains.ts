import { ConstantsUtil, type CaipNetwork } from '@reown/appkit-common'

export const solana = {
  id: 'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp',
  chainId: '5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp',
  name: 'Solana',
  currency: 'SOL',
  explorerUrl: 'https://solscan.io',
  rpcUrl: 'https://rpc.walletconnect.com/v1',
  chainNamespace: ConstantsUtil.CHAIN.SOLANA
} as CaipNetwork

export const solanaTestnet = {
  id: 'solana:4uhcVJyU9pJkvQyS88uRDiswHXSCkY3z',
  chainId: '4uhcVJyU9pJkvQyS88uRDiswHXSCkY3z',
  name: 'Solana Testnet',
  currency: 'SOL',
  explorerUrl: 'https://explorer.solana.com/?cluster=testnet',
  rpcUrl: 'https://rpc.walletconnect.org/v1',
  chainNamespace: ConstantsUtil.CHAIN.SOLANA
} as CaipNetwork

export const solanaDevnet = {
  id: 'solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1',
  chainId: 'EtWTRABZaYq6iMfeYKouRu166VU2xqa1',
  name: 'Solana Devnet',
  currency: 'SOL',
  explorerUrl: 'https://explorer.solana.com/?cluster=devnet',
  rpcUrl: 'https://rpc.walletconnect.org/v1',
  chainNamespace: ConstantsUtil.CHAIN.SOLANA
} as CaipNetwork

export const solanaChains = {
  'solana:mainnet': solana,
  'solana:testnet': solanaTestnet,
  'solana:devnet': solanaDevnet
} as Record<`${string}:${string}`, CaipNetwork>

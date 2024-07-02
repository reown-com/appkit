import { ConstantsUtil } from '@web3modal/common'

export const solana = {
  chainId: '5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp',
  name: 'Solana',
  currency: 'SOL',
  explorerUrl: 'https://solscan.io',
  rpcUrl: `${ConstantsUtil.BLOCKCHAIN_API_RPC_URL}/v1`,
  chain: ConstantsUtil.CHAIN.SOLANA
}

export const solanaTestnet = {
  chainId: '4uhcVJyU9pJkvQyS88uRDiswHXSCkY3z',
  name: 'Solana Testnet',
  currency: 'SOL',
  explorerUrl: 'https://explorer.solana.com/?cluster=testnet',
  rpcUrl: 'https://api.testnet.solana.com',
  chain: ConstantsUtil.CHAIN.SOLANA
}

export const solanaDevnet = {
  chainId: 'EtWTRABZaYq6iMfeYKouRu166VU2xqa1',
  name: 'Solana Devnet',
  currency: 'SOL',
  explorerUrl: 'https://explorer.solana.com/?cluster=devnet',
  rpcUrl: 'https://api.devnet.solana.com',
  chain: ConstantsUtil.CHAIN.SOLANA
}

export const ALL_SOLANA_CHAINS = [solana, solanaTestnet, solanaDevnet]

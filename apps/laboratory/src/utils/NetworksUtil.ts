import * as viemChains from 'viem/chains'

if (!process.env['NEXT_PUBLIC_PROJECT_ID']) {
  throw new Error('NEXT_PUBLIC_PROJECT_ID is required')
}

function getBlockchainApiRpcUrl(chainId: number) {
  return `https://rpc.walletconnect.org/v1/?chainId=eip155:${chainId}&projectId=${process.env['NEXT_PUBLIC_PROJECT_ID']}`
}

export const mainnet = {
  id: 'eip155:1',
  chainId: 1,
  name: 'Ethereum',
  currency: 'ETH',
  explorerUrl: 'https://etherscan.io',
  rpcUrl: getBlockchainApiRpcUrl(1),
  chain: 'evm'
}

export const arbitrum = {
  id: 'eip155:42161',
  chainId: 42161,
  name: 'Arbitrum',
  currency: 'ETH',
  explorerUrl: 'https://arbiscan.io',
  rpcUrl: getBlockchainApiRpcUrl(42161),
  chain: 'evm'
}

export const avalanche = {
  id: 'eip155:43114',
  chainId: 43114,
  name: 'Avalanche',
  currency: 'AVAX',
  explorerUrl: 'https://snowtrace.io',
  rpcUrl: getBlockchainApiRpcUrl(43114),
  chain: 'evm'
}

export const binanceSmartChain = {
  id: 'eip155:56',
  chainId: 56,
  name: 'Binance Smart Chain',
  currency: 'BNB',
  explorerUrl: 'https://bscscan.com',
  rpcUrl: getBlockchainApiRpcUrl(56),
  chain: 'evm'
}

export const optimism = {
  id: 'eip155:10',
  chainId: 10,
  name: 'Optimism',
  currency: 'ETH',
  explorerUrl: 'https://optimistic.etherscan.io',
  rpcUrl: getBlockchainApiRpcUrl(10),
  chain: 'evm'
}

export const polygon = {
  id: 'eip155:137',
  chainId: 137,
  name: 'Polygon',
  currency: 'MATIC',
  explorerUrl: 'https://polygonscan.com',
  rpcUrl: getBlockchainApiRpcUrl(137),
  chain: 'evm'
}

export const gnosis = {
  id: 'eip155:100',
  chainId: 100,
  name: 'Gnosis',
  currency: 'xDAI',
  explorerUrl: 'https://gnosis.blockscout.com',
  rpcUrl: getBlockchainApiRpcUrl(100),
  chain: 'evm'
}

export const zkSync = {
  id: 'eip155:324',
  chainId: 324,
  name: 'ZkSync',
  currency: 'ETH',
  explorerUrl: 'https://explorer.zksync.io',
  rpcUrl: getBlockchainApiRpcUrl(324),
  chain: 'evm'
}

export const zora = {
  id: 'eip155:7777777',
  chainId: 7777777,
  name: 'Zora',
  currency: 'ETH',
  explorerUrl: 'https://explorer.zora.energy',
  rpcUrl: getBlockchainApiRpcUrl(7777777),
  chain: 'evm'
}

export const celo = {
  id: 'eip155:42220',
  chainId: 42220,
  name: 'Celo',
  currency: 'CELO',
  explorerUrl: 'https://explorer.celo.org/mainnet',
  rpcUrl: getBlockchainApiRpcUrl(42220),
  chain: 'evm'
}

export const base = {
  id: 'eip155:8453',
  chainId: 8453,
  name: 'Base',
  currency: 'BASE',
  explorerUrl: 'https://basescan.org',
  rpcUrl: getBlockchainApiRpcUrl(8453),
  chain: 'evm'
}

export const aurora = {
  id: 'eip155:1313161554',
  chainId: 1313161554,
  name: 'Aurora',
  currency: 'ETH',
  explorerUrl: 'https://explorer.aurora.dev',
  rpcUrl: getBlockchainApiRpcUrl(1313161554),
  chain: 'evm'
}

export const sepolia = {
  id: 'eip155:11155111',
  chainId: 11155111,
  name: 'Sepolia',
  currency: 'ETH',
  explorerUrl: 'https://sepolia.etherscan.io',
  rpcUrl: getBlockchainApiRpcUrl(11155111),
  chain: 'evm'
}

export const baseSepolia = {
  id: 'eip155:84532',
  chainId: 84532,
  name: 'Base Sepolia',
  currency: 'BASE',
  explorerUrl: 'https://sepolia.basescan.org',
  rpcUrl: getBlockchainApiRpcUrl(84532),
  chain: 'evm'
}

export const solana = {
  id: 'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp',
  chainId: '5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp',
  name: 'Solana',
  currency: 'SOL',
  explorerUrl: 'https://solscan.io',
  rpcUrl: 'https://rpc.walletconnect.org/v1',
  chain: 'solana'
}

export const solanaTestnet = {
  id: 'solana:4uhcVJyU9pJkvQyS88uRDiswHXSCkY3z',
  chainId: '4uhcVJyU9pJkvQyS88uRDiswHXSCkY3z',
  name: 'Solana Testnet',
  currency: 'SOL',
  explorerUrl: 'https://explorer.solana.com/?cluster=testnet',
  rpcUrl: 'https://rpc.walletconnect.org/v1',
  chain: 'solana'
}

export const solanaDevnet = {
  id: 'solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1',
  chainId: 'EtWTRABZaYq6iMfeYKouRu166VU2xqa1',
  name: 'Solana Devnet',
  currency: 'SOL',
  explorerUrl: 'https://explorer.solana.com/?cluster=devnet',
  rpcUrl: 'https://rpc.walletconnect.org/v1',
  chain: 'solana'
}

export function getChain(id: number) {
  const chains = Object.values(viemChains) as viemChains.Chain[]

  return chains.find(x => x.id === id)
}

export const EIP155ChainData = {
  '1': {
    name: 'Ethereum Mainnet',
    id: 'eip155:1',
    rpc: ['https://api.mycryptoapi.com/eth'],
    slip44: 60,
    testnet: false
  },
  '5': {
    name: 'Ethereum Goerli',
    id: 'eip155:5',
    rpc: ['https://rpc.goerli.mudit.blog'],
    slip44: 60,
    testnet: true
  },
  '11155111': {
    name: 'Ethereum Sepolia',
    id: 'eip155:11155111',
    rpc: ['https://gateway.tenderly.co/public/sepolia	'],
    slip44: 60,
    testnet: true
  },
  '10': {
    name: 'Optimism Mainnet',
    id: 'eip155:10',
    rpc: ['https://mainnet.optimism.io'],
    slip44: 60,
    testnet: false
  },
  '42': {
    name: 'Ethereum Kovan',
    id: 'eip155:42',
    rpc: ['https://kovan.poa.network'],
    slip44: 60,
    testnet: true
  },
  '69': {
    name: 'Optimism Kovan',
    id: 'eip155:69',
    rpc: ['https://kovan.optimism.io'],
    slip44: 60,
    testnet: true
  },
  '100': {
    name: 'xDAI',
    id: 'eip155:100',
    rpc: ['https://dai.poa.network'],
    slip44: 60,
    testnet: false
  },
  '280': {
    name: 'zkSync Era Testnet',
    id: 'eip155:280',
    rpc: ['https://testnet.era.zksync.dev'],
    slip44: 60,
    testnet: true
  },
  '324': {
    name: 'zkSync Era',
    id: 'eip155:324',
    rpc: ['https://mainnet.era.zksync.io'],
    slip44: 60,
    testnet: false
  },
  '137': {
    name: 'Polygon Mainnet',
    id: 'eip155:137',
    rpc: ['https://rpc-mainnet.matic.network'],
    slip44: 60,
    testnet: false
  },
  '420': {
    name: 'Optimism Goerli',
    id: 'eip155:420',
    rpc: ['https://goerli.optimism.io'],
    slip44: 60,
    testnet: true
  },
  '42161': {
    name: 'Arbitrum One',
    id: 'eip155:42161',
    rpc: ['https://arb1.arbitrum.io/rpc'],
    slip44: 60,
    testnet: false
  },
  '42220': {
    name: 'Celo Mainnet',
    id: 'eip155:42220',
    rpc: ['https://forno.celo.org'],
    slip44: 52752,
    testnet: false
  },
  '44787': {
    name: 'Celo Alfajores',
    id: 'eip155:44787',
    rpc: ['https://alfajores-forno.celo-testnet.org'],
    slip44: 52752,
    testnet: true
  },
  '80001': {
    name: 'Polygon Mumbai',
    id: 'eip155:80001',
    rpc: ['https://rpc-mumbai.matic.today'],
    slip44: 60,
    testnet: true
  },
  '421611': {
    name: 'Arbitrum Rinkeby',
    id: 'eip155:421611',
    rpc: ['https://rinkeby.arbitrum.io/rpc'],
    slip44: 60,
    testnet: true
  }
}

export const SolanaChainData = {
  '5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp': {
    id: 'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp',
    name: 'Solana Mainnet',
    rpc: ['https://api.mainnet-beta.solana.com', 'https://solana-api.projectserum.com'],
    slip44: 501,
    testnet: false
  },
  EtWTRABZaYq6iMfeYKouRu166VU2xqa1: {
    id: 'solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1',
    name: 'Solana Devnet',
    rpc: ['https://api.devnet.solana.com'],
    slip44: 501,
    testnet: true
  },
  '4uhcVJyU9pJkvQyS88uRDiswHXSCkY3z': {
    id: 'solana:4uhcVJyU9pJkvQyS88uRDiswHXSCkY3z',
    name: 'Solana Testnet',
    rpc: ['https://api.testnet.solana.com'],
    slip44: 501,
    testnet: true
  }
}

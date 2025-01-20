import { base, baseSepolia, optimism, sepolia } from 'viem/chains'

export const abi = [
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256'
      }
    ],
    name: 'purchase',
    outputs: [],
    stateMutability: 'payable',
    type: 'function'
  },
  {
    inputs: [],
    stateMutability: 'nonpayable',
    type: 'constructor'
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address'
      }
    ],
    name: 'donutBalances',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'check',
        type: 'address'
      }
    ],
    name: 'getBalance',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'owner',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  }
]

export const address = '0x59d6578C1D8FEb2f892f68D4f76f98511F831c6F'

// Deployed on sepolia, base-seoplia, base-mainnet, optimism-mainnet.
export const donutContractSupportedChains = [sepolia, baseSepolia, base, optimism]
export const donutContractSupportedChainsName = donutContractSupportedChains
  .map(chain => chain.name)
  .join(', ')

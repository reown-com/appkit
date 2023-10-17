import { createWeb3Modal, defaultConfig } from '@web3modal/ethers-5/react'

const projectId = process.env['NEXT_PUBLIC_PROJECT_ID']
if (!projectId) {
  throw new Error('NEXT_PUBLIC_PROJECT_ID is not set')
}
const chains = [1, 42161, 137, 43114, 56, 10, 100, 324, 7777777, 8453, 42220, 1313161554]

const ethersConfig = defaultConfig()

if (ethersConfig) {
  createWeb3Modal({ ethersConfig, chains, projectId, enableAnalytics: true })
}

export default function EthersModal() {
  return null
}

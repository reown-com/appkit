import { EVMEthersClient } from '@web3modal/adapter-ethers'

export const projectId = process.env['NEXT_PUBLIC_PROJECT_ID']

if (!projectId) {
  throw new Error('Project ID is not defined')
}

export const ethersAdapter = new EVMEthersClient()

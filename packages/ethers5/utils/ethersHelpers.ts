import { ethers, utils } from 'ethers'
import type { EthereumHelpers } from 'packages/connectors'
import type { Chain } from '@web3modal/scaffold-utils/ethers'

const ensProvider = new ethers.providers.InfuraProvider('mainnet')

export const ethereumHelpers: EthereumHelpers = {
  getAddress: utils.getAddress,
  getENS: async (address: string) => {
    const name = await ensProvider.lookupAddress(address)
    return name as string | undefined
  },
  getAvatar: async (address: string) => {
    const avatar = await ensProvider.getAvatar(address)
    return avatar as string | undefined
  },
  getBalance: async ({ chain, address }: { chain: Chain; address: string }) => {
    const JsonRpcProvider = new ethers.providers.JsonRpcProvider(chain.rpcUrl, {
      chainId: chain.chainId,
      name: chain.name
    })
    const balance = await JsonRpcProvider.getBalance(address)
    return utils.formatEther(balance)
  }
}

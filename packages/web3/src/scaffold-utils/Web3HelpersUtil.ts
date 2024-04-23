// @TODO think about consolidating with packages/scaffold-utils/src/EthersHelpersUtil.ts

import type { CaipNetwork } from '@web3modal/core'
import { ConstantsUtil } from '@web3modal/scaffold-utils'
import { PresetsUtil } from '@web3modal/scaffold-utils'
import type { Address, Chain, Provider } from './Web3TypesUtil.js'

export const Web3HelpersUtil = {
  getCaipDefaultChain(chain?: Chain) {
    if (!chain) {
      return undefined
    }

    return {
      id: `${ConstantsUtil.EIP155}:${chain.chainId}`,
      name: chain.chainName,
      imageId: PresetsUtil.EIP155NetworkImageIds[chain.chainId]
    } as CaipNetwork
  },
  hexStringToNumber(value: string) {
    const string = value.startsWith('0x') ? value.slice(2) : value
    const number = parseInt(string, 16)

    return number
  },
  numberToHexString(value: number) {
    return `0x${value.toString(16)}`
  },
  async getUserInfo(provider: Provider) {
    const [address, chainId] = await Promise.all([
      Web3HelpersUtil.getAddress(provider),
      Web3HelpersUtil.getChainId(provider)
    ])

    return { chainId, address }
  },
  async getChainId(provider: Provider) {
    const chainId = await provider.request<string | number>({ method: 'eth_chainId' })

    return Number(chainId)
  },
  async getAddress(provider: Provider) {
    const [address] = await provider.request<string[]>({ method: 'eth_accounts' })

    return address as Address
  },
  async addEthereumChain(provider: Provider, chain: Chain) {
    await provider.request({
      method: 'wallet_addEthereumChain',
      params: [
        {
          chainId: Web3HelpersUtil.numberToHexString(chain.chainId),
          rpcUrls: chain.rpcUrls,
          chainName: chain.chainName,
          nativeCurrency: {
            name: chain.nativeCurrency.name,
            decimals: 18,
            symbol: chain.nativeCurrency.symbol
          },
          blockExplorerUrls: chain.blockExplorerUrls,
          iconUrls: [PresetsUtil.EIP155NetworkImageIds[chain.chainId]]
        }
      ]
    })
  }
}

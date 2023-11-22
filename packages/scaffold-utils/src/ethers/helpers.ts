import type { CaipNetwork } from '@web3modal/scaffold'
import { ConstantsUtil, PresetsUtil } from '@web3modal/scaffold-utils'
import type { Chain, Provider } from './types.js'

export function getCaipDefaultChain(chain?: Chain) {
  if (!chain) {
    return undefined
  }

  return {
    id: `${ConstantsUtil.EIP155}:${chain.chainId}`,
    name: chain.name,
    imageId: PresetsUtil.EIP155NetworkImageIds[chain.chainId]
  } as CaipNetwork
}

export function hexStringToNumber(value: string) {
  const string = value.startsWith('0x') ? value.slice(2) : value
  const number = parseInt(string, 16)

  return number
}

export function numberToHexString(value: number) {
  return `0x${value.toString(16)}`
}

export async function getUserInfo(provider: Provider) {
  const [address, chainId] = await Promise.all([getAddress(provider), getChainId(provider)])

  return { chainId, address }
}

export async function getAddress(provider: Provider) {
  const [address] = await provider.request<string[]>({ method: 'eth_accounts' })

  return address
}

export async function getChainId(provider: Provider) {
  const chainId = await provider.request<string | number>({ method: 'eth_chainId' })

  return Number(chainId)
}

export async function addEthereumChain(provider: Provider, chain: Chain) {
  await provider.request({
    method: 'wallet_addEthereumChain',
    params: [
      {
        chainId: numberToHexString(chain.chainId),
        rpcUrls: chain.rpcUrl,
        chainName: chain.name,
        nativeCurrency: {
          name: chain.currency,
          decimals: 18,
          symbol: chain.currency
        },
        blockExplorerUrls: chain.explorerUrl,
        iconUrls: [PresetsUtil.EIP155NetworkImageIds[chain.chainId]]
      }
    ]
  })
}

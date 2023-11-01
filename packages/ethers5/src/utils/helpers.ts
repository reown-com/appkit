import type { CaipNetwork } from '@web3modal/scaffold'
import { ConstantsUtil, PresetsUtil } from '@web3modal/utils'
import type { ethers } from 'ethers'
import EthereumProvider from '@walletconnect/ethereum-provider'
import type { Chain } from './types.js'

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

export async function addEthereumChain(
  provider: ethers.providers.Web3Provider | EthereumProvider,
  chain: Chain,
  id: string
) {
  if (id === 'walletConnect') {
    const WalletConnectProvider = provider as EthereumProvider
    await WalletConnectProvider.request({
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
  } else {
    const providerWeb3 = provider as ethers.providers.Web3Provider
    await providerWeb3.send('wallet_addEthereumChain', [
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
    ])
  }
}

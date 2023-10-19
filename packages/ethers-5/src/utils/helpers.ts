import type { CaipNetwork } from '@web3modal/scaffold'
import { ConstantsUtil, PresetsUtil } from '@web3modal/utils'
import {
  NetworkBlockExplorerUrls,
  NetworkNames,
  NetworkRPCUrls,
  networkCurrenySymbols
} from './presets.js'
import type { ethers } from 'ethers'
import EthereumProvider from '@walletconnect/ethereum-provider'

export function getCaipDefaultChain(chain?: number) {
  if (!chain) {
    return undefined
  }

  return {
    id: `${ConstantsUtil.NAMESPACE}:${chain}`,
    name: NetworkNames[chain],
    imageId: PresetsUtil.NetworkImageIds[chain]
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
  chainId: number,
  id: string
) {
  if (id === 'walletConnect') {
    const WalletConnectProvider = provider as EthereumProvider
    await WalletConnectProvider.request({
      method: 'wallet_addEthereumChain',
      params: [
        {
          chainId: numberToHexString(chainId),
          rpcUrls: [NetworkRPCUrls[chainId]],
          chainName: NetworkNames[chainId],
          nativeCurrency: {
            name: networkCurrenySymbols[chainId],
            decimals: 18,
            symbol: networkCurrenySymbols[chainId]
          },
          blockExplorerUrls: [NetworkBlockExplorerUrls[chainId]],
          iconUrls: [PresetsUtil.NetworkImageIds[chainId]]
        }
      ]
    })
  } else {
    const providerWeb3 = provider as ethers.providers.Web3Provider
    await providerWeb3.send('wallet_addEthereumChain', [
      {
        chainId: numberToHexString(chainId),
        rpcUrls: [NetworkRPCUrls[chainId]],
        chainName: NetworkNames[chainId],
        nativeCurrency: {
          name: networkCurrenySymbols[chainId],
          decimals: 18,
          symbol: networkCurrenySymbols[chainId]
        },
        blockExplorerUrls: [NetworkBlockExplorerUrls[chainId]],
        iconUrls: [PresetsUtil.NetworkImageIds[chainId]]
      }
    ])
  }
}

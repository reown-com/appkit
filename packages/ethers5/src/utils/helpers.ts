import EthereumProvider from '@walletconnect/ethereum-provider'
import { PresetsUtil } from '@web3modal/scaffold-utils'
import { numberToHexString, type Chain } from '@web3modal/scaffold-utils/ethers'
import type { ethers } from 'ethers'

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

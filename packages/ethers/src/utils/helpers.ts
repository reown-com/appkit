import { PresetsUtil } from '@web3modal/scaffold-utils'
import { numberToHexString, type Chain } from '@web3modal/scaffold-utils/ethers'
import type { Provider } from './types.js'

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

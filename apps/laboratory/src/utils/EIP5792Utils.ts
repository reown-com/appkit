import { EthereumProvider } from '@walletconnect/ethereum-provider'
import type { GetCapabilitiesResult } from '../types/EIP5792'
import { getChain } from './ChainsUtil'
import { parseJSON } from './CommonUtils'

export function getAtomicBatchSupportedChainInfo(
  provider: Awaited<ReturnType<(typeof EthereumProvider)['init']>>,
  address: string
): {
  chainId: number
  chainName: string
}[] {
  if (address && provider?.signer?.session?.sessionProperties) {
    const walletCapabilitiesString = provider.signer.session.sessionProperties['capabilities']
    const walletCapabilities = walletCapabilitiesString && parseJSON(walletCapabilitiesString)
    const accountCapabilities = walletCapabilities[address] as GetCapabilitiesResult
    const chainIds = Object.keys(accountCapabilities).map(chainIdAsHex => Number(chainIdAsHex))
    const chainInfo = chainIds.map(id => {
      const chain = getChain(id)
      return {
        chainId: id,
        chainName: chain?.name ?? `Unknown Chain(${id})`
      }
    })

    return chainInfo
  }

  return []
}

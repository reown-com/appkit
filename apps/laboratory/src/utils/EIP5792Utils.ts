import { EthereumProvider } from '@walletconnect/ethereum-provider'
import { getChain } from './ChainsUtil'
import { parseJSON } from './CommonUtils'
import type { WalletCapabilities } from 'viem'

export const EIP_5792_RPC_METHODS = {
  WALLET_GET_CALLS_STATUS: 'wallet_getCallsStatus',
  WALLET_SEND_CALLS: 'wallet_sendCalls'
}

export function getCapabilitySupportedChainInfoForEthers(
  capability:string,
  provider: Awaited<ReturnType<(typeof EthereumProvider)['init']>>,
  address: string
): {
  chainId: number
  chainName: string
}[] {
  if (address && provider?.signer?.session?.sessionProperties) {
    const walletCapabilitiesString = provider.signer.session.sessionProperties['capabilities']
    const walletCapabilities = walletCapabilitiesString && parseJSON(walletCapabilitiesString)
    const accountCapabilities = walletCapabilities[address]
    const chainIds = accountCapabilities
      ? Object.keys(accountCapabilities).filter( chainIdAsHex =>
         (accountCapabilities[chainIdAsHex]?.[capability]?.supported === true)
      ).map(chainIdAsHex => Number(chainIdAsHex))
      : []
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

export function getCapabilitySupportedChainInfoForViem(
  capability: string,
  capabilities: Record<number, WalletCapabilities>
): {
  chainId: number
  chainName: string
}[] {
  const chainIds = Object.keys(capabilities)
  const chainInfo = chainIds
    .filter(chainId => {
      const capabilitiesPerChain = capabilities[parseInt(chainId, 10)]

      return capabilitiesPerChain?.[capability]?.supported === true
    })
    .map(chainId => {
      const capabilityChain = getChain(parseInt(chainId, 10))

      return {
        chainId: parseInt(chainId, 10),
        chainName: capabilityChain?.name ?? `Unknown Chain(${chainId})`
      }
    })

  return chainInfo
}

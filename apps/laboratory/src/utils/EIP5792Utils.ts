import { EthereumProvider } from '@walletconnect/ethereum-provider'
import { getChain } from './ChainsUtil'
import { parseJSON } from './CommonUtils'

export const EIP_5792_RPC_METHODS = {
  WALLET_GET_CALLS_STATUS: 'wallet_getCallsStatus',
  WALLET_SEND_CALLS: 'wallet_sendCalls'
}

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
    const accountCapabilities = walletCapabilities[address]
    const chainIds = accountCapabilities
      ? Object.keys(accountCapabilities).map(chainIdAsHex => Number(chainIdAsHex))
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

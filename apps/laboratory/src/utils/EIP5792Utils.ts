import { EthereumProvider } from '@walletconnect/ethereum-provider'
import { getChain } from './ChainsUtil'
import { parseJSON } from './CommonUtils'
import type { WalletCapabilities } from 'viem'

export const EIP_5792_RPC_METHODS = {
  WALLET_GET_CALLS_STATUS: 'wallet_getCallsStatus',
  WALLET_SEND_CALLS: 'wallet_sendCalls'
}
export const EIP_7715_RPC_METHODS = {
  WALLET_GRANT_PERMISSIONS: 'wallet_grantPermissions'
}

export const WALLET_CAPABILITIES = {
  ATOMIC_BATCH: 'atomicBatch',
  PAYMASTER_SERVICE: 'paymasterService',
  PERMISSIONS: 'permissions'
}

export function getFilteredCapabilitySupportedChainInfo(
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
    .map(cId => {
      const chainId = parseInt(cId, 10)
      const capabilityChain = getChain(chainId)

      return {
        chainId,
        chainName: capabilityChain?.name ?? `Unknown Chain(${chainId})`
      }
    })

  return chainInfo
}

/* eslint-disable @typescript-eslint/no-explicit-any */
export function convertCapabilitiesToRecord(
  accountCapabilities: Record<string, any>
): Record<number, WalletCapabilities> {
  return Object.fromEntries(
    Object.entries(accountCapabilities).map(([key, value]) => [parseInt(key, 16), value])
  )
}
/* eslint-enable @typescript-eslint/no-explicit-any */

export function getProviderCachedCapabilities(
  address: string,
  provider: Awaited<ReturnType<(typeof EthereumProvider)['init']>>
) {
  const walletCapabilitiesString = provider.signer?.session?.sessionProperties?.['capabilities']
  if (!walletCapabilitiesString) {
    return undefined
  }
  const walletCapabilities = parseJSON(walletCapabilitiesString)
  const accountCapabilities = walletCapabilities[address]
  if (!accountCapabilities) {
    return undefined
  }

  return convertCapabilitiesToRecord(accountCapabilities)
}

export function getCapabilitySupportedChainInfo(
  capability: string,
  provider: Awaited<ReturnType<(typeof EthereumProvider)['init']>>,
  address: string
): {
  chainId: number
  chainName: string
}[] {
  const perChainCapabilities = getProviderCachedCapabilities(address, provider)
  if (!perChainCapabilities) {
    return []
  }

  return getFilteredCapabilitySupportedChainInfo(capability, perChainCapabilities)
}

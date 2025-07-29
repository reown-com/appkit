import { UniversalProvider } from '@walletconnect/universal-provider'
import { type WalletCapabilities, fromHex, toHex } from 'viem'

import type { Address, Hex } from '@reown/appkit-common'
import { W3mFrameProvider } from '@reown/appkit-wallet'

import { parseJSON } from './CommonUtils'
import { getChain } from './NetworksUtil'

export const EIP_5792_RPC_METHODS = {
  WALLET_GET_CAPABILITIES: 'wallet_getCapabilities',
  WALLET_GET_CALLS_STATUS: 'wallet_getCallsStatus',
  WALLET_SEND_CALLS: 'wallet_sendCalls'
}
export const EIP_7715_RPC_METHODS = {
  WALLET_GRANT_PERMISSIONS: 'wallet_grantPermissions',
  WALLET_REVOKE_PERMISSIONS: 'wallet_revokePermissions'
}

export const WALLET_CAPABILITIES = {
  ATOMIC_BATCH: 'atomic',
  PAYMASTER_SERVICE: 'paymasterService',
  PERMISSIONS: 'permissions'
}

export function getFilteredCapabilitySupportedChainInfo(
  capability: string,
  capabilities: Record<number | string, WalletCapabilities>
): {
  chainId: number
  chainName: string
}[] {
  const chainIds = Object.keys(capabilities)
  const chainInfo = chainIds
    .filter(chainId => isCapabilitySupported(capabilities, capability, chainId as Hex))
    .map(cId => {
      const chainId = fromHex(cId as Address, 'number')
      const capabilityChain = getChain(chainId)

      return {
        chainId,
        chainName: capabilityChain?.name ?? `Unknown Chain(${chainId})`
      }
    })

  return chainInfo
}

export function convertCapabilitiesToRecord(
  /* eslint-disable @typescript-eslint/no-explicit-any */
  accountCapabilities: Record<string, any>
): Record<number, WalletCapabilities> {
  return Object.fromEntries(
    Object.entries(accountCapabilities).map(([key, value]) => [parseInt(key, 16), value])
  )
}

export function getProviderCachedCapabilities(
  address: string,
  provider: Awaited<ReturnType<(typeof UniversalProvider)['init']>>
) {
  const walletCapabilitiesString = provider?.session?.sessionProperties?.['capabilities']
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

export async function getCapabilities({
  provider,
  chainIds,
  address
}: {
  provider: Awaited<ReturnType<(typeof UniversalProvider)['init']>> | W3mFrameProvider
  chainIds: string[] | number[]
  address: string
}): Promise<Record<number, WalletCapabilities>> {
  if (provider instanceof W3mFrameProvider) {
    return await provider.getCapabilities()
  }

  const chainIdsInHex = chainIds.map(cId => toHex(cId))

  const capabilities = await provider.request<any>({
    method: 'wallet_getCapabilities',
    params: [address, chainIdsInHex]
  })

  if (!capabilities) {
    return {}
  }

  return capabilities
}

export function getCapabilitySupportedChainInfo(capabilities: Record<number, WalletCapabilities>): {
  chainId: number
  chainName: string
}[] {
  return Object.keys(capabilities).map(chainId => {
    const chain = getChain(fromHex(chainId as Address, 'number'))

    return {
      chainId: fromHex(chainId as Address, 'number'),
      chainName: chain?.name ?? `Unknown Chain (${chainId})`
    }
  })
}

export function isCapabilitySupported(
  capabilities: WalletCapabilities,
  capability: string,
  chainId: Hex
) {
  const chainCapabilities = capabilities?.[chainId]
  if (!chainCapabilities) {
    return false
  }
  switch (capability) {
    case WALLET_CAPABILITIES.ATOMIC_BATCH:
      return (
        chainCapabilities?.atomic?.status === 'supported' ||
        chainCapabilities?.atomic?.status === 'ready' ||
        // For backward compatibility
        chainCapabilities?.atomicBatch?.supported === true
      )
    case WALLET_CAPABILITIES.PAYMASTER_SERVICE:
      return chainCapabilities?.paymasterService?.supported === true
    case WALLET_CAPABILITIES.PERMISSIONS:
      return chainCapabilities?.permissions?.supported === true
    default:
      return false
  }
}

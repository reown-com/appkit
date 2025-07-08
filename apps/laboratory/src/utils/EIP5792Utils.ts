import { UniversalProvider } from '@walletconnect/universal-provider'
import { type WalletCapabilities, fromHex } from 'viem'

import type { Address } from '@reown/appkit-common'
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
  ATOMIC_BATCH: 'atomicBatch',
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
    .filter(chainId => {
      const capabilitiesPerChain = capabilities[chainId]

      return capabilitiesPerChain?.[capability]?.supported === true
    })
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

export async function getCapabilitySupportedChainInfo(
  capability: string,
  provider: Awaited<ReturnType<(typeof UniversalProvider)['init']>> | W3mFrameProvider,
  address: string
): Promise<
  {
    chainId: number
    chainName: string
  }[]
> {
  if (provider instanceof W3mFrameProvider) {
    const rawCapabilities = await provider.getCapabilities()
    const mappedCapabilities = Object.entries(rawCapabilities).map(([chainId]) => {
      const chain = getChain(fromHex(chainId as Address, 'number'))

      return {
        chainId: fromHex(chainId as Address, 'number'),
        chainName: chain?.name ?? `Unknown Chain (${chainId})`
      }
    })

    return mappedCapabilities
  }

  const perChainCapabilities = getProviderCachedCapabilities(address, provider)
  if (!perChainCapabilities) {
    return []
  }

  return getFilteredCapabilitySupportedChainInfo(capability, perChainCapabilities)
}

import { UniversalProvider } from '@walletconnect/universal-provider'
import { type WalletCapabilities, fromHex, type Hex } from 'viem'
import { type Eip1193Provider } from 'ethers'

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
      if (!capabilitiesPerChain) return false

      if (capability === WALLET_CAPABILITIES.ATOMIC_BATCH) {
        const metamaskAtomic = (capabilitiesPerChain as any).atomic
        if (metamaskAtomic && typeof metamaskAtomic === 'object' && metamaskAtomic.status === 'supported') {
          return true
        }
        if (capabilitiesPerChain[WALLET_CAPABILITIES.ATOMIC_BATCH]?.supported === true) {
          return true
        }
        return false
      }

      return capabilitiesPerChain?.[capability]?.supported === true
    })
    .map(cId => {
      const chainId = fromHex(cId as `0x${string}`, 'number')
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

// Define a type for an initialized UniversalProvider instance
type InitializedUniversalProvider = Awaited<ReturnType<(typeof UniversalProvider)['init']>>

export async function getCapabilitySupportedChainInfo(
  capability: string,
  provider: InitializedUniversalProvider | W3mFrameProvider | Eip1193Provider,
  address: string
): Promise<
  {
    chainId: number
    chainName: string
  }[]
> {
  if (provider instanceof W3mFrameProvider) {
    const rawCapabilities = await provider.getCapabilities()
    return getFilteredCapabilitySupportedChainInfo(capability, rawCapabilities)
  }
  // Check for an initialized UniversalProvider instance (it should have a session object)
  else if (provider instanceof UniversalProvider && (provider as InitializedUniversalProvider).session) {
    const perChainCapabilities = getProviderCachedCapabilities(address, provider as InitializedUniversalProvider)
    if (!perChainCapabilities) {
      return []
    }
    return getFilteredCapabilitySupportedChainInfo(capability, perChainCapabilities)
  }
  // Fallback to generic EIP-1193 provider (this should catch injected MetaMask)
  else if (typeof (provider as Eip1193Provider).request === 'function') {
    try {
      const genericCapabilities = await (provider as Eip1193Provider).request({
        method: 'wallet_getCapabilities',
        params: [address]
      }) as Record<Hex, WalletCapabilities>
      if (genericCapabilities) {
        return getFilteredCapabilitySupportedChainInfo(capability, genericCapabilities)
      }
      return []
    } catch (e) {
      console.error('[EIP5792Utils] Error fetching capabilities from generic EIP-1193 provider:', e)
      return []
    }
  }
  // If none of the above, it's an unknown provider type or not properly initialized
  console.warn('[EIP5792Utils] Unknown or unhandled provider type in getCapabilitySupportedChainInfo.', provider);
  return [];
}

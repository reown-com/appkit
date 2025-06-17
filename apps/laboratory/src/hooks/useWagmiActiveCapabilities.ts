import { useEffect, useMemo, useState } from 'react'

import type UniversalProvider from '@walletconnect/universal-provider'
import { type Address, type Hex, type WalletCapabilities, toHex } from 'viem'
import { type Connector, useAccount } from 'wagmi'
import { type Chain } from 'wagmi/chains'

import { W3mFrameProvider } from '@reown/appkit-wallet'
import { useAppKitAccount } from '@reown/appkit/react'

import {
  EIP_5792_RPC_METHODS,
  EIP_7715_RPC_METHODS,
  getFilteredCapabilitySupportedChainInfo,
  getProviderCachedCapabilities
} from '../utils/EIP5792Utils'

type UseWagmiAvailableCapabilitiesParams = {
  capability?: string
  method: string
}

export type Provider = UniversalProvider | W3mFrameProvider

export function useWagmiAvailableCapabilities({
  capability,
  method
}: UseWagmiAvailableCapabilitiesParams) {
  const [provider, setProvider] = useState<Provider>()
  const [supported, setSupported] = useState<boolean>(false)

  const [availableCapabilities, setAvailableCapabilities] = useState<
    Record<Hex, WalletCapabilities> | undefined
  >()

  const { address, isConnected } = useAppKitAccount()
  const { chain, connector } = useAccount()

  const supportedChains = useMemo(
    () =>
      availableCapabilities && capability
        ? getFilteredCapabilitySupportedChainInfo(capability, availableCapabilities)
        : [],
    [availableCapabilities, capability]
  )

  const supportedChainsName = useMemo(
    () => supportedChains.map(ci => ci.chainName).join(', '),
    [supportedChains]
  )

  const currentChainsInfo = useMemo(
    () => supportedChains.find(chainInfo => chainInfo.chainId === Number(chain?.id)),
    [supportedChains, chain]
  )

  async function fetchProviderAndAccountCapabilities(
    connectedAccount: Address,
    connectedConnector: Connector,
    connectedChain: Chain
  ) {
    const connectedProvider = (await connectedConnector.getProvider?.({
      chainId: connectedChain.id
    })) as Provider

    if (!connectedProvider) {
      return
    }

    setProvider(connectedProvider)

    if (connectedProvider instanceof W3mFrameProvider) {
      const walletCapabilities = await connectedProvider.getCapabilities()
      setAvailableCapabilities(walletCapabilities)
    } else {
      const walletCapabilities = getProviderCachedCapabilities(connectedAccount, connectedProvider)
      setAvailableCapabilities(walletCapabilities)
    }
  }

  // Adjusted to be async and handle generic EIP-1193 providers
  async function isMethodSupportedAsync(): Promise<boolean> {
    if (!provider || !address || !chain) {
      return false
    }

    if (provider instanceof W3mFrameProvider) {
      // For W3mFrameProvider, check if the method is one of the known EIP-5792/7715 methods.
      // This assumes W3mFrameProvider would support them if it's advertising capabilities for them.
      // A more robust check might involve inspecting capabilities returned by W3mFrameProvider.getCapabilities()
      // to see if the specific 'method' or a related 'capability' (like atomicBatch for wallet_sendCalls) is listed.
      const knownExperimentalMethods = Object.values(EIP_5792_RPC_METHODS).concat(
        Object.values(EIP_7715_RPC_METHODS)
      )
      if (knownExperimentalMethods.includes(method)) {
        // If a specific capability (e.g., ATOMIC_BATCH) is being checked,
        // ensure it's also present in availableCapabilities for the current chain.
        if (capability && availableCapabilities) {
          const currentChainHex = toHex(chain.id)
          const capabilityOnConnectChain = availableCapabilities[currentChainHex]
          return Boolean(capabilityOnConnectChain?.[capability]?.supported)
        }
        // If no specific capability is requested, and the method is known, assume support.
        return true
      }
      return false
    }

    // Check for UniversalProvider session style
    if (provider.session?.namespaces?.['eip155']?.methods?.includes(method)) {
      // Similar to W3mFrameProvider, if a specific capability is being checked,
      // ensure it's also present in availableCapabilities for the current chain.
      if (capability && availableCapabilities) {
        const currentChainHex = toHex(chain.id)
        const capabilityOnConnectChain = availableCapabilities[currentChainHex]
        return Boolean(capabilityOnConnectChain?.[capability]?.supported)
      }
      return true
    }

    // Fallback for generic EIP-1193 providers (like injected MetaMask)
    if (typeof provider.request === 'function') {
      try {
        const allCapabilities = (await provider.request({
          method: 'wallet_getCapabilities',
          params: [address]
          // No params: []
          // As per EIP-5792, wallet_getCapabilities takes no parameters.
          // The capabilities are returned for the currently selected account.
        })) as Record<Hex, WalletCapabilities>

        if (allCapabilities) {
          // Update availableCapabilities state if fetched this way
          // This is important if fetchProviderAndAccountCapabilities didn't cover this provider type
          if (!availableCapabilities && Object.keys(allCapabilities).length > 0) {
            setAvailableCapabilities(allCapabilities)
          }
          
          const currentChainHex = toHex(chain.id)
          const chainCaps = allCapabilities[currentChainHex]

          if (chainCaps) {
            // If a specific capability (e.g., 'atomicBatch') is requested, check it
            if (capability) {
              if (!chainCaps[capability]?.supported) {
                return false // Required capability not supported
              }
              // If the capability is 'atomicBatch' and method is 'wallet_sendCalls',
              // EIP-5792 implies wallet_sendCalls is supported if atomicBatch is.
              if (
                capability === WALLET_CAPABILITIES.ATOMIC_BATCH &&
                method === EIP_5792_RPC_METHODS.WALLET_SEND_CALLS
              ) {
                return true
              }
              // For other capabilities, we might need more specific logic here
              // or assume the method is supported if the capability is present.
              // This might need refinement based on specific EIPs.
              // For now, if the capability is supported, assume the related method is.
              return true
            } else {
              // No specific capability requested, check if the method itself is somehow listed
              // EIP-5792 wallet_getCapabilities primarily returns capabilities, not a list of RPC methods.
              // So, if no 'capability' is specified, it's hard to verify the 'method' directly
              // unless the wallet explicitly includes an rpc_methods like field in its capabilities response,
              // which is not standard for EIP-5792.
              // However, if 'wallet_sendCalls' is the method, and 'atomicBatch' is supported, that's a positive signal.
              if (
                method === EIP_5792_RPC_METHODS.WALLET_SEND_CALLS &&
                chainCaps[WALLET_CAPABILITIES.ATOMIC_BATCH]?.supported
              ) {
                return true
              }
              // Add similar checks for other methods if they are implied by other capabilities
            }
          }
        }
      } catch (e) {
        console.error('Error fetching/processing capabilities for generic EIP-1193 provider:', e)
        return false
      }
    }

    return false
  }

  useEffect(() => {
    async function checkConnectionAndFetch() {
      if (isConnected && connector && address && chain) {
        await fetchProviderAndAccountCapabilities(address as Address, connector, chain)
      }
    }

    checkConnectionAndFetch()
  }, [connector, address, chain, isConnected])

  useEffect(() => {
    async function updateSupportState() {
      if (!provider || !address || !chain) {
        setSupported(false)
        return
      }

      const methodIsSupported = await isMethodSupportedAsync()

      if (!capability) {
        setSupported(methodIsSupported)
        return
      }

      // This part remains largely the same but uses the result of isMethodSupportedAsync
      if (availableCapabilities) {
        const currentChainHex = toHex(chain.id)
        const capabilityOnConnectChain = availableCapabilities[currentChainHex]
        // Ensure the general method is supported AND the specific capability is present on the chain
        setSupported(Boolean(capabilityOnConnectChain?.[capability]?.supported && methodIsSupported))
      } else if (methodIsSupported) {
        // If availableCapabilities is not yet populated (e.g. for generic EIP-1193),
        // but wallet_getCapabilities within isMethodSupportedAsync might have confirmed support
        // (especially if it populated availableCapabilities itself or confirmed the method/capability directly)
        // This branch might need refinement based on how availableCapabilities is updated by the generic path.
        // For now, if methodIsSupported is true (which implies capability check passed if 'capability' is set),
        // we set supported to true.
        setSupported(true)
      } else {
        setSupported(false)
      }
    }

    updateSupportState()
  }, [
    chain,
    availableCapabilities,
    capability,
    provider,
    address,
    isConnected,
    connector,
    method // Added method as a dependency
  ])

  return {
    provider,
    currentChainsInfo,
    availableCapabilities,
    supportedChains,
    supportedChainsName,
    supported
  }
}

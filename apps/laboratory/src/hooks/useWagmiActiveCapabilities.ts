import { EthereumProvider } from '@walletconnect/ethereum-provider'
import { useAccount, type Connector } from 'wagmi'
import { useState, useEffect, useCallback, useMemo } from 'react'
import { type WalletCapabilities } from 'viem'
import { type Chain } from 'wagmi/chains'
import {
  getFilteredCapabilitySupportedChainInfo,
  getProviderCachedCapabilities
} from '../utils/EIP5792Utils'
import { W3mFrameProvider } from '@web3modal/wallet'

type UseWagmiAvailableCapabilitiesParams = {
  capability?: string
  method: string
}

export type Provider = Awaited<ReturnType<(typeof EthereumProvider)['init']>> | W3mFrameProvider

export function useWagmiAvailableCapabilities({
  capability,
  method
}: UseWagmiAvailableCapabilitiesParams) {
  const [provider, setProvider] = useState<Provider>()
  const [availableCapabilities, setAvailableCapabilities] = useState<
    Record<number, WalletCapabilities> | undefined
  >()

  const { chain, address, connector, isConnected } = useAccount()

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

  const fetchProviderAndAccountCapabilities = useCallback(
    async (
      connectedAccount: `0x${string}`,
      connectedConnector: Connector,
      connectedChain: Chain
    ) => {
      const connectedProvider = await connectedConnector.getProvider?.({
        chainId: connectedChain.id
      })
      if (connectedProvider instanceof W3mFrameProvider) {
        setProvider(prevProvider => {
          if (prevProvider === connectedProvider) {
            return prevProvider
          }

          return connectedProvider
        })
      } else if (connectedProvider) {
        const ethereumProvider = connectedProvider as Awaited<
          ReturnType<(typeof EthereumProvider)['init']>
        >
        setProvider(prevProvider => {
          if (prevProvider === ethereumProvider) {
            return prevProvider
          }

          return ethereumProvider
        })

        const walletCapabilities = getProviderCachedCapabilities(connectedAccount, ethereumProvider)
        setAvailableCapabilities(prevCapabilities => {
          if (prevCapabilities === walletCapabilities) {
            return prevCapabilities
          }

          return walletCapabilities
        })
      }
    },
    []
  )

  useEffect(() => {
    if (isConnected && connector && address && chain) {
      fetchProviderAndAccountCapabilities(address, connector, chain)
    }
  }, [connector, address, chain, isConnected, fetchProviderAndAccountCapabilities])

  const isMethodSupported = useCallback((): boolean => {
    if (provider instanceof W3mFrameProvider) {
      return true
    }

    return Boolean(provider?.signer?.session?.namespaces?.['eip155']?.methods?.includes(method))
  }, [provider, method])

  return {
    ethereumProvider: provider,
    currentChainsInfo,
    availableCapabilities,
    supportedChains,
    supportedChainsName,
    isMethodSupported
  }
}

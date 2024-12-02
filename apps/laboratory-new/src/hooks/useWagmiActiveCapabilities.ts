import type UniversalProvider from '@walletconnect/universal-provider'
import { useAccount, type Connector } from 'wagmi'
import { useState, useEffect, useMemo } from 'react'
import { type Address, type WalletCapabilities } from 'viem'
import { type Chain } from 'wagmi/chains'
import {
  EIP_5792_RPC_METHODS,
  EIP_7715_RPC_METHODS,
  getFilteredCapabilitySupportedChainInfo,
  getProviderCachedCapabilities
} from '../utils/EIP5792Utils'
import { W3mFrameProvider } from '@reown/appkit-wallet'
import { useAppKitAccount } from '@reown/appkit-new/react'

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
    Record<number, WalletCapabilities> | undefined
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

  useEffect(() => {
    if (isConnected && connector && address && chain) {
      fetchProviderAndAccountCapabilities(address as Address, connector, chain)
    }
  }, [connector, address, chain, isConnected])

  async function fetchProviderAndAccountCapabilities(
    connectedAccount: `0x${string}`,
    connectedConnector: Connector,
    connectedChain: Chain
  ) {
    const connectedProvider = (await connectedConnector.getProvider?.({
      chainId: connectedChain.id
    })) as Provider
    if (connectedProvider instanceof W3mFrameProvider) {
      const walletCapabilities = await connectedProvider.getCapabilities()
      setProvider(connectedProvider)
      setAvailableCapabilities(walletCapabilities)
    } else if (connectedProvider) {
      setProvider(connectedProvider)
      const walletCapabilities = getProviderCachedCapabilities(connectedAccount, connectedProvider)
      setAvailableCapabilities(walletCapabilities)
    }
  }

  function isMethodSupported(): boolean {
    if (provider instanceof W3mFrameProvider) {
      const supportedMethods = Object.values(EIP_5792_RPC_METHODS).concat(
        Object.values(EIP_7715_RPC_METHODS)
      )

      return supportedMethods.includes(method)
    }

    return Boolean(provider?.session?.namespaces?.['eip155']?.methods?.includes(method))
  }

  useEffect(() => {
    const isGetCapabilitiesSupported = isMethodSupported()
    setSupported(isGetCapabilitiesSupported)
  }, [provider])

  return {
    provider,
    currentChainsInfo,
    availableCapabilities,
    supportedChains,
    supportedChainsName,
    supported
  }
}

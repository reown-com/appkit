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

  function isMethodSupported(): boolean {
    if (!provider) {
      return false
    }

    if (provider instanceof W3mFrameProvider) {
      const supportedMethods = Object.values(EIP_5792_RPC_METHODS).concat(
        Object.values(EIP_7715_RPC_METHODS)
      )

      return supportedMethods.includes(method)
    }

    return Boolean(provider?.session?.namespaces?.['eip155']?.methods?.includes(method))
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
    if (!capability) {
      setSupported(isMethodSupported())

      return
    }

    if (chain && availableCapabilities) {
      const capabilityOnConnectChain = availableCapabilities[toHex(chain.id)]
      setSupported(Boolean(capabilityOnConnectChain?.[capability] && isMethodSupported()))
    }
  }, [chain, availableCapabilities, capability, provider])

  return {
    provider,
    currentChainsInfo,
    availableCapabilities,
    supportedChains,
    supportedChainsName,
    supported
  }
}

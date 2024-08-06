import { EthereumProvider } from '@walletconnect/ethereum-provider'
import { useAccount, type Connector } from 'wagmi'
import { useState, useEffect, useMemo } from 'react'
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
  const [supported, setSupported] = useState<boolean>(false)

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

  useEffect(() => {
    if (isConnected && connector && address && chain) {
      fetchProviderAndAccountCapabilities(address, connector, chain)
    }
  }, [connector, address, chain, isConnected])

  async function fetchProviderAndAccountCapabilities(
    connectedAccount: `0x${string}`,
    connectedConnector: Connector,
    connectedChain: Chain
  ) {
    const connectedProvider = await connectedConnector.getProvider?.({
      chainId: connectedChain.id
    })
    if (connectedProvider instanceof EthereumProvider) {
      setProvider(connectedProvider)
      const walletCapabilities = getProviderCachedCapabilities(connectedAccount, connectedProvider)
      setAvailableCapabilities(walletCapabilities)
    } else if (connectedProvider instanceof W3mFrameProvider) {
      const walletCapabilities = await connectedProvider.getCapabilities()
      setProvider(connectedProvider)
      setAvailableCapabilities(walletCapabilities)
    }
  }

  function isMethodSupported(): boolean {
    if (provider instanceof W3mFrameProvider) {
      return [
        'wallet_sendCalls',
        'wallet_getCapabilities',
        'wallet_getCallsStatus',
        'wallet_grantPermissions'
      ].includes(method)
    }

    return Boolean(provider?.signer?.session?.namespaces?.['eip155']?.methods?.includes(method))
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

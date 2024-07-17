import { EthereumProvider } from '@walletconnect/ethereum-provider'
import { useAccount, type Connector } from 'wagmi'
import { useState, useEffect } from 'react'
import { type WalletCapabilities } from 'viem'
import { type Chain } from 'wagmi/chains'
import {
  EIP_5792_RPC_METHODS,
  getFilteredCapabilitySupportedChainInfo,
  getProviderCachedCapabilities
} from '../utils/EIP5792Utils'

type UseWagmiAvailableCapabilitiesParams = {
  capability: string
}

export function useWagmiAvailableCapabilities({ capability }: UseWagmiAvailableCapabilitiesParams) {
  const [ethereumProvider, setEthereumProvider] =
    useState<Awaited<ReturnType<(typeof EthereumProvider)['init']>>>()

  const { chain, address, connector } = useAccount()

  const [availableCapabilities, setAvailableCapabilities] = useState<
    Record<number, WalletCapabilities> | undefined
  >()

  const supportedChains = availableCapabilities
    ? getFilteredCapabilitySupportedChainInfo(capability, availableCapabilities)
    : []
  const supportedChainsName = supportedChains.map(ci => ci.chainName).join(', ')
  const currentChainsInfo = supportedChains.find(
    chainInfo => chainInfo.chainId === Number(chain?.id)
  )

  useEffect(() => {
    if (connector && address && chain) {
      fetchProviderAndAccountCapabilities(address, connector, chain)
    }
  }, [connector, address])

  async function fetchProviderAndAccountCapabilities(
    connectedAccount: `0x${string}`,
    connectedConnector: Connector,
    connectedChain: Chain
  ) {
    const connectedProvider = await connectedConnector.getProvider?.({
      chainId: connectedChain.id
    })
    if (connectedProvider instanceof EthereumProvider) {
      setEthereumProvider(connectedProvider)
      let walletCapabilities = undefined
      walletCapabilities = getProviderCachedCapabilities(connectedAccount, connectedProvider)
      setAvailableCapabilities(walletCapabilities)
    }
  }

  function isSendCallsSupported(): boolean {
    return Boolean(
      ethereumProvider?.signer?.session?.namespaces?.['eip155']?.methods?.includes(
        EIP_5792_RPC_METHODS.WALLET_SEND_CALLS
      )
    )
  }

  return {
    currentChainsInfo,
    availableCapabilities,
    supportedChains,
    supportedChainsName,
    isSendCallsSupported
  }
}

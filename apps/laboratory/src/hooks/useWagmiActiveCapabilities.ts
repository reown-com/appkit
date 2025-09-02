import { useCallback, useEffect, useMemo, useState } from 'react'

import type UniversalProvider from '@walletconnect/universal-provider'
import { type Address, type WalletCapabilities } from 'viem'
import { type Connector, useAccount } from 'wagmi'
import { type Chain } from 'wagmi/chains'

import { W3mFrameProvider } from '@reown/appkit-wallet'
import { useAppKitAccount } from '@reown/appkit/react'

import { getCapabilities } from '../utils/EIP5792Utils'

export type Provider = UniversalProvider | W3mFrameProvider

export function useWagmiAvailableCapabilities() {
  const [provider, setProvider] = useState<Provider>()
  const { address, isConnected } = useAppKitAccount()
  const { chain, connector } = useAccount()
  const [hasFetchedCapabilities, setHasFetchedCapabilities] = useState(false)

  const [availableCapabilities, setAvailableCapabilities] = useState<
    WalletCapabilities | undefined
  >()

  useEffect(() => {
    if (connector) {
      connector
        .getProvider?.({
          chainId: chain?.id
        })
        .then(currentProvider => {
          setProvider(currentProvider as Provider)
        })
    }
  }, [connector, chain])

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

    setHasFetchedCapabilities(true)

    const walletCapabilities = await getCapabilities({
      provider: connectedProvider,
      chainIds: [Number(connectedChain.id)],
      address: connectedAccount
    })
    setAvailableCapabilities(walletCapabilities)
  }

  const fetchCapabilities = useCallback(async () => {
    if (isConnected && connector && address && chain) {
      await fetchProviderAndAccountCapabilities(address as Address, connector, chain)
    }
  }, [connector, address, chain, isConnected])

  const isMethodSupported = useCallback(
    (method: string) => {
      if (provider instanceof W3mFrameProvider) {
        return true
      }

      return provider?.session?.namespaces?.['eip155']?.methods?.includes(method)
    },
    [provider]
  )

  const capabilitiesToRender = useMemo(() => {
    if (!hasFetchedCapabilities) {
      return undefined
    }

    if (hasFetchedCapabilities && !availableCapabilities) {
      return 'No capabilities found'
    }

    return JSON.stringify(availableCapabilities, null, 2)
  }, [hasFetchedCapabilities, availableCapabilities])

  return {
    provider,
    isConnected,
    address,
    chain,
    availableCapabilities,
    hasFetchedCapabilities,
    fetchCapabilities,
    isMethodSupported,
    capabilitiesToRender
  }
}

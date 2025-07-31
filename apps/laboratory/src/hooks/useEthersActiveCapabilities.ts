import { useCallback, useMemo, useState } from 'react'

import type UniversalProvider from '@walletconnect/universal-provider'
import { type WalletCapabilities } from 'viem'

import { W3mFrameProvider } from '@reown/appkit-wallet'
import { useAppKitAccount, useAppKitNetwork, useAppKitProvider } from '@reown/appkit/react'

import { getCapabilities } from '../utils/EIP5792Utils'

export type Provider = UniversalProvider | W3mFrameProvider

export function useEthersActiveCapabilities() {
  const { walletProvider } = useAppKitProvider<
    W3mFrameProvider | Awaited<ReturnType<(typeof UniversalProvider)['init']>>
  >('eip155')
  const { address } = useAppKitAccount({ namespace: 'eip155' })
  const { chainId } = useAppKitNetwork()
  const [capabilities, setCapabilities] = useState<WalletCapabilities | undefined>()
  const [hasFetchedCapabilities, setHasFetchedCapabilities] = useState(false)

  const fetchCapabilities = useCallback(async () => {
    if (!address || !walletProvider) {
      return
    }

    setHasFetchedCapabilities(true)
    const allCapabilities = await getCapabilities({
      provider: walletProvider,
      chainIds: [Number(chainId)],
      address
    })
    setCapabilities(allCapabilities)
  }, [address, walletProvider, chainId])

  const capabilitiesToRender = useMemo(() => {
    if (!hasFetchedCapabilities) {
      return undefined
    }

    if (hasFetchedCapabilities && !capabilities) {
      return 'No capabilities found'
    }

    return JSON.stringify(capabilities, null, 2)
  }, [hasFetchedCapabilities, capabilities])

  const isMethodSupported = useCallback(
    (method: string) => {
      if (walletProvider instanceof W3mFrameProvider) {
        return true
      }

      return walletProvider?.session?.namespaces?.['eip155']?.methods?.includes(method)
    },
    [walletProvider]
  )

  return {
    walletProvider,
    address,
    chainId,
    capabilities,
    hasFetchedCapabilities,
    fetchCapabilities,
    isMethodSupported,
    capabilitiesToRender
  }
}

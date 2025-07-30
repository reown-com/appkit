import { useEffect, useMemo, useState } from 'react'

import type UniversalProvider from '@walletconnect/universal-provider'
import { type Hex, type WalletCapabilities } from 'viem'

import { W3mFrameProvider } from '@reown/appkit-wallet'

import {
  getFilteredCapabilitySupportedChainInfo,
  isCapabilitySupported
} from '../utils/EIP5792Utils'

type UseCapabilitiesParams = {
  capabilities?: Record<Hex, WalletCapabilities>
  capability: string
  chainId?: Hex
}

export type Provider = UniversalProvider | W3mFrameProvider

export function useCapabilities({ capabilities, capability, chainId }: UseCapabilitiesParams) {
  const [isSupported, setIsSupported] = useState<boolean>(false)

  const supportedChains = useMemo(() => {
    if (capabilities && capability && chainId) {
      return getFilteredCapabilitySupportedChainInfo(capability, capabilities)
    }

    return []
  }, [capabilities, capability, chainId])

  const supportedChainsName = useMemo(
    () => supportedChains.map(ci => ci.chainName).join(', '),
    [supportedChains]
  )
  const currentChainsInfo = useMemo(
    () => supportedChains.find(chainInfo => chainInfo.chainId === Number(chainId)),
    [supportedChains, chainId]
  )
  useEffect(() => {
    if (capabilities && capability && chainId) {
      setIsSupported(isCapabilitySupported(capabilities, capability, chainId))
    }
  }, [capabilities, chainId, capability])

  return {
    isSupported,
    currentChainsInfo,
    supportedChains,
    supportedChainsName
  }
}

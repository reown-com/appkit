import * as React from 'react'
import UniversalProvider from '@walletconnect/universal-provider'

import { useAccount } from 'wagmi'
import { AppKitInfo } from '../AppKitInfo'
import { useAppKitAccount } from '@reown/appkit-new/react'

export function WagmiModalInfo() {
  const { caipAddress, address, isConnected } = useAppKitAccount()
  const { chainId, connector } = useAccount()
  const [clientId, setClientId] = React.useState<string | null>(null)

  async function getClientId() {
    if (connector?.type === 'walletConnect') {
      const provider = await connector?.getProvider?.()
      const universalProvider = provider as UniversalProvider

      return universalProvider?.client?.core?.crypto?.getClientId()
    }

    return null
  }

  React.useEffect(() => {
    getClientId().then(setClientId)
  }, [connector])

  return isConnected ? (
    <AppKitInfo
      caipAddress={caipAddress}
      address={address}
      chainId={chainId}
      clientId={clientId || undefined}
    />
  ) : null
}

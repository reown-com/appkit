import * as React from 'react'

import UniversalProvider from '@walletconnect/universal-provider'
import { useAccount } from 'wagmi'

import { useAppKitAccount } from '@reown/appkit/react'

import { AppKitInfo } from '@/src/components/AppKitInfo'

export function WagmiModalInfo() {
  const { isConnected } = useAppKitAccount()
  const { connector } = useAccount()
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

  return isConnected ? <AppKitInfo clientId={clientId || undefined} /> : null
}

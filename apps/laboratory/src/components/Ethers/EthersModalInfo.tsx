import * as React from 'react'

import UniversalProvider from '@walletconnect/universal-provider'

import { useAppKitAccount, useAppKitNetwork, useAppKitProvider } from '@reown/appkit/react'

import { AppKitInfo } from '@/src/components/AppKitInfo'

export function EthersModalInfo() {
  const [isReady, setReady] = React.useState(false)
  const [clientId, setClientId] = React.useState<string | undefined>(undefined)
  const { isConnected } = useAppKitAccount()
  const { chainId } = useAppKitNetwork()
  const { walletProvider, walletProviderType } = useAppKitProvider<UniversalProvider>('eip155')

  async function getClientId() {
    if (walletProviderType === 'WALLET_CONNECT') {
      return await walletProvider?.client?.core?.crypto?.getClientId()
    }

    return undefined
  }

  React.useEffect(() => {
    getClientId().then(setClientId)
  }, [walletProvider])

  React.useEffect(() => {
    setReady(true)
  }, [])

  return isReady && isConnected && chainId ? <AppKitInfo clientId={clientId} /> : null
}

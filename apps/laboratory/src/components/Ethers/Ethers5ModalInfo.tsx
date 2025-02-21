import * as React from 'react'

import UniversalProvider from '@walletconnect/universal-provider'

import { useAppKitAccount, useAppKitProvider } from '@reown/appkit/react'

import { AppKitInfo } from '@/src/components/AppKitInfo'

export function Ethers5ModalInfo() {
  const [isReady, setIsReady] = React.useState(false)
  const [clientId, setClientId] = React.useState<string | undefined>(undefined)

  const { isConnected } = useAppKitAccount()
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
    setIsReady(true)
  }, [])

  return isReady && isConnected ? <AppKitInfo clientId={clientId} /> : null
}

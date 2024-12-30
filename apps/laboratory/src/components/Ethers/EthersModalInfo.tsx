import * as React from 'react'
import { useAppKitAccount, useAppKitNetwork, useAppKitProvider } from '@reown/appkit/react'
import UniversalProvider from '@walletconnect/universal-provider'

import { AppKitInfo } from '../AppKitInfo'

export function EthersModalInfo() {
  const [ready, setReady] = React.useState(false)
  const [clientId, setClientId] = React.useState<string | undefined>(undefined)
  const { isConnected, address, caipAddress, user } = useAppKitAccount()
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

  return ready && isConnected && chainId ? (
    <AppKitInfo
      caipAddress={caipAddress}
      address={address}
      chainId={chainId}
      clientId={clientId}
      user={user}
    />
  ) : null
}

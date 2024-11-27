import * as React from 'react'
import { useAppKitAccount, useAppKitNetwork, useAppKitProvider } from '@reown/appkit-new/react'
import UniversalProvider from '@walletconnect/universal-provider'

import { AppKitInfo } from '../AppKitInfo'

export function Ethers5ModalInfo() {
  const [ready, setReady] = React.useState(false)
  const [clientId, setClientId] = React.useState<string | undefined>(undefined)

  const { chainId } = useAppKitNetwork()
  const { isConnected, address, caipAddress } = useAppKitAccount()
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

  return ready && isConnected ? (
    <AppKitInfo
      caipAddress={caipAddress}
      address={address}
      chainId={Number(chainId)}
      clientId={clientId}
    />
  ) : null
}

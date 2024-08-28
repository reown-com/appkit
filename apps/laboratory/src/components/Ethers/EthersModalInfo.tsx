import * as React from 'react'
import { useWeb3ModalAccount, useWeb3ModalProvider } from '@web3modal/base/react'
import EthereumProvider from '@walletconnect/ethereum-provider'

import { AppKitInfo } from '../AppKitInfo'

export function EthersModalInfo() {
  const [ready, setReady] = React.useState(false)
  const [clientId, setClientId] = React.useState<string | undefined>(undefined)
  const { isConnected, address } = useWeb3ModalAccount()
  const { walletProvider, walletProviderType } = useWeb3ModalProvider<EthereumProvider>('eip155')

  async function getClientId() {
    if (walletProviderType === 'walletConnect') {
      return await walletProvider?.signer?.client?.core?.crypto?.getClientId()
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
    <AppKitInfo address={address} chainId={1} clientId={clientId} />
  ) : null
}

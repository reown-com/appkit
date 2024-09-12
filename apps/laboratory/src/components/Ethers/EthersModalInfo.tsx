import * as React from 'react'
import {
  useWeb3ModalAccount,
  useWeb3ModalNetwork,
  useWeb3ModalProvider
} from '@rerock/appkit/react'
import EthereumProvider from '@walletconnect/ethereum-provider'

import { AppKitInfo } from '../AppKitInfo'

export function EthersModalInfo() {
  const [ready, setReady] = React.useState(false)
  const [clientId, setClientId] = React.useState<string | undefined>(undefined)
  const { isConnected, address } = useWeb3ModalAccount()
  const { chainId } = useWeb3ModalNetwork()
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

  return ready && isConnected && chainId ? (
    <AppKitInfo address={address} chainId={chainId} clientId={clientId} />
  ) : null
}

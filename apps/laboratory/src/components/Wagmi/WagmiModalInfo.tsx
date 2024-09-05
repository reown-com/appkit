import * as React from 'react'
import EthereumProvider from '@walletconnect/ethereum-provider'

import { useAccount } from 'wagmi'
import { AppKitInfo } from '../AppKitInfo'
import { useWeb3ModalAccount } from '@web3modal/base/react'

export function WagmiModalInfo() {
  const { address } = useWeb3ModalAccount()
  const { isConnected, chainId, connector } = useAccount()
  const [clientId, setClientId] = React.useState<string | null>(null)

  async function getClientId() {
    if (connector?.type === 'walletConnect') {
      const provider = await connector?.getProvider?.()
      const ethereumProvider = provider as EthereumProvider

      return ethereumProvider?.signer?.client?.core?.crypto?.getClientId()
    }

    return null
  }

  React.useEffect(() => {
    getClientId().then(setClientId)
  }, [connector])

  return isConnected ? (
    <AppKitInfo address={address} chainId={chainId} clientId={clientId || undefined} />
  ) : null
}

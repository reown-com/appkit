import * as React from 'react'

import { AppKitInfo } from '../AppKitInfo'
import { useAppKitAccount, useAppKitNetwork } from '@reown/appkit/react'

export function SolanaModalInfo() {
  const { caipAddress, address, isConnected } = useAppKitAccount()
  const { chainId } = useAppKitNetwork()

  return isConnected ? (
    <AppKitInfo caipAddress={caipAddress} address={address} chainId={chainId} />
  ) : null
}

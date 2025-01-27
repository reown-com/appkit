import * as React from 'react'

import { useAppKitAccount, useAppKitNetwork } from '@reown/appkit-new/react'

import { AppKitInfo } from '../AppKitInfo'

export function SolanaModalInfo() {
  const { caipAddress, address, isConnected } = useAppKitAccount()
  const { chainId } = useAppKitNetwork()

  return isConnected ? (
    <AppKitInfo caipAddress={caipAddress} address={address} chainId={chainId} />
  ) : null
}

import * as React from 'react'

import { useAccount } from 'wagmi'
import { Web3ModalInfo } from '../Web3ModalInfo'

export function WagmiModalInfo() {
  const { isConnected, address, chainId } = useAccount()

  return isConnected ? <Web3ModalInfo address={address} chainId={chainId} /> : null
}

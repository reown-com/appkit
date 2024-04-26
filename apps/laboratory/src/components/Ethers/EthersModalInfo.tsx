import * as React from 'react'
import { useWeb3ModalAccount } from '@web3modal/ethers/react'

import { Web3ModalInfo } from '../Web3ModalInfo'

export function EthersModalInfo() {
  const { isConnected, address, chainId } = useWeb3ModalAccount()

  return isConnected ? <Web3ModalInfo address={address} chainId={chainId} /> : null
}

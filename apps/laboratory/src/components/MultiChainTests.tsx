import * as React from 'react'
import { useWeb3ModalState } from '@web3modal/base/react'

import { SolanaTests } from './Solana/SolanaTests'
import { EthersTests } from './Ethers/EthersTests'

export function MultiChainTests() {
  const { activeChain } = useWeb3ModalState()

  return (
    <>
      {activeChain === 'evm' ? <EthersTests /> : null}
      {activeChain === 'solana' ? <SolanaTests /> : null}
    </>
  )
}

import * as React from 'react'
import { useWeb3ModalState } from '@rerock/base/react'

import { SolanaTests } from './Solana/SolanaTests'
import { EthersTests } from './Ethers/EthersTests'

export function MultiChainTestsEthersSolana() {
  const { activeChain } = useWeb3ModalState()

  return (
    <>
      {activeChain === 'eip155' ? <EthersTests /> : null}
      {activeChain === 'solana' ? <SolanaTests /> : null}
    </>
  )
}

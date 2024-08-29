import * as React from 'react'
import { useWeb3ModalState } from '@web3modal/base/react'

import { SolanaTests } from './Solana/SolanaTests'
import { WagmiTests } from './Wagmi/WagmiTests'

export function MultiChainTestsWagmiSolana() {
  const { activeChain } = useWeb3ModalState()

  return (
    <>
      {activeChain === 'eip155' ? <WagmiTests /> : null}
      {activeChain === 'solana' ? <SolanaTests /> : null}
    </>
  )
}

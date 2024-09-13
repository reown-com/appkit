import * as React from 'react'
import { useAppKitState } from '@reown/appkit/react'

import { SolanaTests } from './Solana/SolanaTests'
import { EthersTests } from './Ethers/EthersTests'

export function MultiChainTestsEthersSolana() {
  const { activeChain } = useAppKitState()

  return (
    <>
      {activeChain === 'eip155' ? <EthersTests /> : null}
      {activeChain === 'solana' ? <SolanaTests /> : null}
    </>
  )
}

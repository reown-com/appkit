import * as React from 'react'
import { useAppKitState } from '@reown/appkit/react'

import { SolanaTests } from './Solana/SolanaTests'
import { WagmiTests } from './Wagmi/WagmiTests'

export function MultiChainTestsWagmiSolana() {
  const { activeChain } = useAppKitState()

  return (
    <>
      {activeChain === 'eip155' ? <WagmiTests /> : null}
      {activeChain === 'solana' ? <SolanaTests /> : null}
    </>
  )
}

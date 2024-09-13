import * as React from 'react'
import { useWeb3ModalState } from '@reown/appkit/react'

import { SolanaTests } from './Solana/SolanaTests'
import { WagmiTests } from './Wagmi/WagmiTests'
import { AppKitNetworkInfo } from './AppKitNetworkInfo'

export function MultiChainTestsWagmiSolana() {
  const { activeChain } = useWeb3ModalState()

  return (
    <>
      <AppKitNetworkInfo />
      {activeChain === 'eip155' ? <WagmiTests /> : null}
      {activeChain === 'solana' ? <SolanaTests /> : null}
    </>
  )
}

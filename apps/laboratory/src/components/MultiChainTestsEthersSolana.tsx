import * as React from 'react'
import { useAppKitState } from '@reown/appkit/react'

import { SolanaTests } from './Solana/SolanaTests'
import { EthersTests } from './Ethers/EthersTests'
import { EthersModalInfo } from './Ethers/EthersModalInfo'
import { SolanaModalInfo } from './Solana/SolanaModalInfo'

export function MultiChainTestsEthersSolana() {
  const { activeChain } = useAppKitState()

  return (
    <>
      {activeChain === 'eip155' ? (
        <React.Fragment>
          <EthersModalInfo />
          <EthersTests />
        </React.Fragment>
      ) : null}
      {activeChain === 'solana' ? (
        <React.Fragment>
          <SolanaModalInfo />
          <SolanaTests />
        </React.Fragment>
      ) : null}
    </>
  )
}

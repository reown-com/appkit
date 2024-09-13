import * as React from 'react'
import { useWeb3ModalState } from '@reown/appkit/react'

import { SolanaTests } from './Solana/SolanaTests'
import { EthersTests } from './Ethers/EthersTests'
import { EthersModalInfo } from './Ethers/EthersModalInfo'

export function MultiChainTestsEthersSolana() {
  const { activeChain } = useWeb3ModalState()

  return (
    <>
      {activeChain === 'eip155' ? (
        <React.Fragment>
          <EthersModalInfo />
          <EthersTests />
        </React.Fragment>
      ) : null}
      {activeChain === 'solana' ? <SolanaTests /> : null}
    </>
  )
}

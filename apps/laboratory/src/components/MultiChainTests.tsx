import * as React from 'react'
import { useWeb3ModalState } from '@web3modal/base/react'
import { WagmiTests } from './Wagmi/WagmiTests'
import { SolanaTests } from './Solana/SolanaTests'

type MultiChainTestsProps = {}

export function MultiChainTests({}: MultiChainTestsProps) {
  const { activeChain } = useWeb3ModalState()

  return (
    <>
      {activeChain === 'evm' ? <WagmiTests /> : null}
      {activeChain === 'solana' ? <SolanaTests /> : null}
    </>
  )
}

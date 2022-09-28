import type { Web3ModalEthereum } from '@web3modal/ethereum'

export interface BlockCtrlState {
  blockNumber: number
}

export type BlockCtrlFetchArgs = Parameters<typeof Web3ModalEthereum.fetchBlockNumber>[0]

import type { EthereumOptions, Web3ModalEthereum } from '@web3modal/ethereum'

export interface ClientCtrlState {
  initialized: boolean
  ethereum?: typeof Web3ModalEthereum
}

export type ClientCtrlSetEthereumClientArgs = EthereumOptions

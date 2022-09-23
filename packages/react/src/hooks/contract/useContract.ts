import { ClientCtrl } from '@web3modal/core'
import type { GetContractArgs } from '@web3modal/ethereum'

export function useContract(...args: GetContractArgs) {
  return ClientCtrl.ethereum().getContract(...args)
}

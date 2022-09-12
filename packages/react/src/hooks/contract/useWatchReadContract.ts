import { ClientCtrl } from '@web3modal/core'
import type { WatchReadContractOpts } from '@web3modal/ethereum'

export function useWatchReadContract(opts: WatchReadContractOpts) {
  ClientCtrl.ethereum().watchReadContract(opts)
}

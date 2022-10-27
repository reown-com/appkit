import type { ContractCtrlWatchEventArgs } from '@web3modal/core'
import { ContractCtrl } from '@web3modal/core'
import { createEffect, onCleanup } from 'solid-js'
import { useChainAgnosticOptions } from '../utils/useChainAgnosticOptions'
import { useClientInitialized } from './useClientInitialized'

type Arguments = ContractCtrlWatchEventArgs[0] &
  ContractCtrlWatchEventArgs[3] & {
    eventName: ContractCtrlWatchEventArgs[1]
    listener: ContractCtrlWatchEventArgs[2]
  }

export function useContractEvent(args: Arguments) {
  const { chainId: argChainId, once, listener, eventName, ...contractArgs } = args
  const { chainId } = useChainAgnosticOptions({ chainId: argChainId })
  const initialized = useClientInitialized()

  let unwatch: (() => void) | undefined = undefined
  createEffect(() => {
    if (initialized())
      unwatch = ContractCtrl.watchEven(contractArgs, eventName, listener, { chainId, once })
  })
  onCleanup(() => unwatch?.())
}

import type { ContractCtrlWatchEventArgs } from '@web3modal/core'
import { ContractCtrl } from '@web3modal/core'
import { useEffect } from 'react'
import { useClientInitialized } from '../data/useClientInitialized'
import { useChainAgnosticOptions } from '../utils/useChainAgnosticOptions'

type Arguments = ContractCtrlWatchEventArgs[0] &
  ContractCtrlWatchEventArgs[3] & {
    eventName: ContractCtrlWatchEventArgs[1]
    listener: ContractCtrlWatchEventArgs[2]
  }

export function useContractEvent(args: Arguments) {
  const { chainId: argChainId, once, listener, eventName, ...contractArgs } = args
  const { chainId } = useChainAgnosticOptions({ chainId: argChainId })
  const initialized = useClientInitialized()

  useEffect(() => {
    let unwatch: (() => void) | undefined = undefined
    if (initialized)
      unwatch = ContractCtrl.watchEvent(contractArgs, eventName, listener, { chainId, once })

    return () => {
      unwatch?.()
    }
  }, [initialized, eventName, chainId, once, contractArgs, listener])
}

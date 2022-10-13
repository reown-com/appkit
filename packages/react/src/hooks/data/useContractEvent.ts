import type { ContractCtrlWatchEventArgs } from '@web3modal/core'
import { ContractCtrl } from '@web3modal/core'
import { useEffect, useMemo } from 'react'
import { useClientInitialized } from '../data/useClientInitialized'
import { useChainAgnosticOptions } from '../utils/useChainAgnosticOptions'

type Arguments = ContractCtrlWatchEventArgs[0] & {
  listener: ContractCtrlWatchEventArgs[1]
}

export function useContractEvent(args: Arguments) {
  const { listener } = args
  const chainAgnosticArgs = useChainAgnosticOptions(args)
  const initialized = useClientInitialized()

  // We can't use raw args here as that will cause infinite-loop inside useEffect
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const memoArgs = useMemo(() => chainAgnosticArgs, [JSON.stringify(chainAgnosticArgs)])

  useEffect(() => {
    let unwatch: (() => void) | undefined = undefined
    if (initialized) unwatch = ContractCtrl.watchEvent(listener, memoArgs)

    return () => {
      unwatch?.()
    }
  }, [initialized, memoArgs, listener])
}

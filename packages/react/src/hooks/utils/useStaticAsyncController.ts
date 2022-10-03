import { useEffect, useState } from 'react'
import { useBlockNumber } from '../data/useBlockNumber'
import type { Controller, Options } from './useBaseAsyncController'
import { useBaseAsyncController } from './useBaseAsyncController'

const THREE_SECONDS = 3000

export function useStaticAsyncController<TReturn, TOptions extends Options>(
  controller: Controller<TReturn, TOptions>,
  options: TOptions
) {
  const { data, error, isLoading, watch, enabled, chainId, isFirstFetch, ready, onFetch } =
    useBaseAsyncController(controller, options)
  const [lastTime, setLastTime] = useState(0)
  const { data: blockNumber } = useBlockNumber({ watch, enabled: enabled && watch, chainId })

  useEffect(() => {
    const timeNow = Date.now()
    const isBlockNumber = Boolean(blockNumber)
    const isTimeAllowed = timeNow > lastTime + THREE_SECONDS
    if (!isFirstFetch && watch && ready && isBlockNumber && isTimeAllowed) {
      setLastTime(timeNow)
      onFetch()
    }
  }, [blockNumber, isFirstFetch, watch, ready, lastTime, setLastTime, onFetch])

  return {
    data,
    error,
    isLoading,
    onFetch
  }
}

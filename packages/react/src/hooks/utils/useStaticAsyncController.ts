import { useEffect, useState } from 'react'
import { useBlockNumber } from '../data/useBlockNumber'
import type { Controller, Options } from './useBaseAsyncController'
import { useBaseAsyncController } from './useBaseAsyncController'

const THREE_SECONDS = 3000

export function useStaticAsyncController<TReturn, TOptions extends Options>(
  controller: Controller<TReturn, TOptions>,
  options: TOptions
) {
  const [lastTime, setLastTime] = useState(0)
  const { data, error, isLoading, watch, enabled, chainId, initial, ready, onFetch } =
    useBaseAsyncController(controller, options)
  const { data: blockNumber } = useBlockNumber({ watch, enabled: enabled && watch, chainId })

  useEffect(() => {
    const timeNow = Date.now()
    if (!initial && watch && ready && Boolean(blockNumber) && timeNow > lastTime + THREE_SECONDS) {
      onFetch({ skipLoading: true })
      setLastTime(timeNow)
    }
  }, [blockNumber, initial, watch, ready, lastTime, setLastTime, onFetch])

  return {
    data,
    error,
    isLoading,
    onFetch
  }
}

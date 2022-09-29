import { useEffect } from 'react'
import { useBlockNumber } from '../data/useBlockNumber'
import type { Controller, Options } from './useBaseAsyncController'
import { useBaseAsyncController } from './useBaseAsyncController'

export function useStaticAsyncController<R, O extends Options>(
  controller: Controller<R, O>,
  options: O
) {
  const { data, error, isLoading, watch, enabled, chainId, initial, ready, onFetch } =
    useBaseAsyncController(controller, options)
  const { data: blockNumber } = useBlockNumber({ watch, enabled: enabled && watch, chainId })

  useEffect(() => {
    if (!initial && watch && ready && Boolean(blockNumber)) onFetch({ skipLoading: true })
  }, [blockNumber, initial, watch, ready, onFetch])

  return {
    data,
    error,
    isLoading,
    onFetch
  }
}

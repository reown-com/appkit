import { useCallback, useEffect, useState } from 'react'
import { useBlockNumber } from '../data/useBlockNumber'
import { useClientInitialized } from '../data/useClientInitialized'

// -- types ----------------------------------------------------- //
interface Controller<R, O> {
  fetch: (args: O) => Promise<R>
}

interface Options {
  watch?: boolean
  enabled?: boolean
  chainId?: number
}

export interface RefetchArgs {
  skipLoading?: boolean
}

// -- hook ------------------------------------------------------ //
export function useStaticAsyncController<R, O extends Options>(
  controller: Controller<R, O>,
  options: O
) {
  const [data, setData] = useState<R | undefined>(undefined)
  const [error, setError] = useState<Error | undefined>(undefined)
  const [isLoading, setIsLoading] = useState(true)
  const [initial, setInitial] = useState(true)
  const enabled = typeof options.enabled === 'undefined' ? true : options.enabled
  const watch = options.watch ?? false
  const initialized = useClientInitialized()
  const { data: blockNumber } = useBlockNumber({
    watch,
    enabled: enabled && watch,
    chainId: options.chainId
  })
  const ready = initialized && enabled

  const onFetch = useCallback(
    async (args?: RefetchArgs) => {
      try {
        if (!args?.skipLoading) setIsLoading(true)
        const newData = await controller.fetch(options)
        setData(newData)
        setError(undefined)
      } catch (err: unknown) {
        if (err instanceof Error) setError(err)
        else setError(new Error('Unknown error'))
      } finally {
        setIsLoading(false)
      }
    },
    [controller, options]
  )

  useEffect(() => {
    if (initial && !watch && ready) onFetch()
    setInitial(false)
  }, [ready, initial, watch, onFetch])

  useEffect(() => {
    if (!initial && watch && ready && Boolean(blockNumber)) onFetch({ skipLoading: true })
  }, [blockNumber, initial, watch, ready, onFetch])

  useEffect(() => {
    if (!enabled) setIsLoading(false)
  }, [enabled, watch])

  return {
    data,
    error,
    isLoading,
    onFetch
  }
}

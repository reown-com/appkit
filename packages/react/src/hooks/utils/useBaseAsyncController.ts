import { useCallback, useEffect, useState } from 'react'
import { useClientInitialized } from '../data/useClientInitialized'
import { useOptionsChange } from './useOptionsChange'

// -- types ----------------------------------------------------- //
export interface Controller<TReturn, TOptions> {
  fetch: (args: TOptions) => Promise<TReturn>
}

export interface Options {
  watch?: boolean
  enabled?: boolean
  chainId?: number
  forceInitialFetch?: boolean
}

export interface RefetchArgs {
  skipLoading?: boolean
}

// -- hook ------------------------------------------------------ //
export function useBaseAsyncController<TReturn, TOptions extends Options>(
  controller: Controller<TReturn, TOptions>,
  options: TOptions
) {
  const enabled = typeof options.enabled === 'undefined' ? true : options.enabled
  const { chainId, watch, forceInitialFetch } = options
  const [initial, setInitial] = useState(true)
  const [data, setData] = useState<TReturn | undefined>(undefined)
  const [error, setError] = useState<Error | undefined>(undefined)
  const [isLoading, setIsLoading] = useState(true)
  const initialized = useClientInitialized()
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
    if (initial && (!watch || forceInitialFetch) && ready) onFetch()
    setInitial(false)
  }, [ready, initial, watch, forceInitialFetch, onFetch])

  useEffect(() => {
    if (!enabled) setIsLoading(false)
  }, [enabled])

  useOptionsChange(() => {
    if (!initial && !watch) onFetch()
  }, options)

  return {
    data,
    error,
    isLoading,
    initial,
    ready,
    watch,
    chainId,
    enabled,
    onFetch,
    setData,
    setIsLoading
  }
}

import { useCallback, useEffect, useState } from 'react'
import { useClientInitialized } from '../data/useClientInitialized'
import { useAddressChange } from './useAddressChange'
import { useChainIdChange } from './useChainIdChange'

// -- types ----------------------------------------------------- //
export interface Controller<R, O> {
  fetch: (args: O) => Promise<R>
}

export interface Options {
  watch?: boolean
  enabled?: boolean
  chainId?: number
  addressOrName?: string
  forceInitialFetch?: boolean
}

export interface RefetchArgs {
  skipLoading?: boolean
}

// -- hook ------------------------------------------------------ //
export function useBaseAsyncController<R, O extends Options>(
  controller: Controller<R, O>,
  options: O
) {
  const enabled = typeof options.enabled === 'undefined' ? true : options.enabled
  const { chainId, addressOrName, watch, forceInitialFetch } = options
  const [initial, setInitial] = useState(true)
  const [data, setData] = useState<R | undefined>(undefined)
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

  useChainIdChange(() => {
    if (!initial && !watch) onFetch()
  }, chainId)

  useAddressChange(() => {
    if (!initial && !watch) onFetch()
  }, addressOrName)

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

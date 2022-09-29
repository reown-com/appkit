import { useCallback, useEffect, useState } from 'react'
import { useClientInitialized } from '../data/useClientInitialized'

// -- types ----------------------------------------------------- //
interface Controller<R, O> {
  fetch: (args: O) => Promise<R>
  watch: (args: O, callback: (data: R) => void) => () => void
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
export function useStaticAsyncWatchableController<R, O extends Options>(
  controller: Controller<R, O>,
  options: O
) {
  const enabled = typeof options.enabled === 'undefined' ? true : options.enabled
  const watch = options.watch ?? false
  const { chainId } = options

  const [initial, setInitial] = useState(true)
  const [prevChainId, setPrevChainId] = useState(chainId)

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
    if (initial && !watch && ready) onFetch()
    setInitial(false)
  }, [ready, initial, watch, onFetch])

  useEffect(() => {
    let unwatch: (() => void) | undefined = undefined
    if (!initial && watch && ready)
      unwatch = controller.watch(options, newData => {
        setData(newData)
        setIsLoading(false)
      })

    return () => {
      unwatch?.()
    }
  }, [initial, watch, ready, options, controller])

  useEffect(() => {
    if (!enabled) setIsLoading(false)
  }, [enabled])

  useEffect(() => {
    if (chainId && prevChainId && !initial && !watch && chainId !== prevChainId) onFetch()
    setPrevChainId(chainId)
  }, [chainId, prevChainId, initial, ready, watch, onFetch])

  return {
    data,
    error,
    isLoading,
    onFetch
  }
}

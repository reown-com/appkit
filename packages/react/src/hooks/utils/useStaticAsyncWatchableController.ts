import { useEffect } from 'react'
import type { Controller, Options } from './useBaseAsyncController'
import { useBaseAsyncController } from './useBaseAsyncController'

// -- types ----------------------------------------------------- //
interface WatchController<TReturn, TOptions> extends Controller<TReturn, TOptions> {
  watch: (args: TOptions, callback: (data: TReturn) => void) => () => void
}

// -- hook ------------------------------------------------------ //
export function useStaticAsyncWatchableController<TReturn, TOptions extends Options>(
  controller: WatchController<TReturn, TOptions>,
  options: TOptions
) {
  const { data, error, isLoading, initial, watch, ready, onFetch, setData, setIsLoading } =
    useBaseAsyncController(controller, options)

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
  }, [initial, watch, ready, options, controller, setData, setIsLoading])

  return {
    data,
    error,
    isLoading,
    onFetch
  }
}

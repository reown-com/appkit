import { useEffect } from 'react'
import type { Controller, Options } from './useBaseAsyncController'
import { useBaseAsyncController } from './useBaseAsyncController'

// -- types ----------------------------------------------------- //
interface WatchController<R, O> extends Controller<R, O> {
  watch: (args: O, callback: (data: R) => void) => () => void
}

// -- hook ------------------------------------------------------ //
export function useStaticAsyncWatchableController<R, O extends Options>(
  controller: WatchController<R, O>,
  options: O
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

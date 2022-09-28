import { useCallback, useEffect, useState } from 'react'
import { useClientInitialized } from '../data/useClientInitialized'

// -- types ----------------------------------------------------- //
interface Controller<S, O> {
  state: S
  fetch: (args?: O) => Promise<void>
  watch: (args?: O) => () => void
  subscribe: (callback: (newData: S) => void) => () => void
}

interface Options {
  watch?: boolean
}

// -- hook ------------------------------------------------------ //
export function useStatefullAsyncController<S, O extends Options>(
  controller: Controller<S, O>,
  options?: O
) {
  const [data, setData] = useState(controller.state)
  const [error, setError] = useState<Error | undefined>(undefined)
  const [isLoading, setIsLoading] = useState(false)
  const initialized = useClientInitialized()

  const onFetch = useCallback(async () => {
    try {
      setIsLoading(true)
      await controller.fetch(options)
      setError(undefined)
    } catch (err: unknown) {
      if (err instanceof Error) setError(err)
      else setError(new Error('Unknown error'))
    } finally {
      setIsLoading(false)
    }
  }, [controller, options])

  useEffect(() => {
    let unwatch: (() => void) | undefined = undefined
    let unsubscribe: (() => void) | undefined = undefined
    if (initialized) {
      unsubscribe = controller.subscribe(newData => setData({ ...newData }))
      onFetch()
      if (options?.watch) unwatch = controller.watch(options)
    }

    return () => {
      unsubscribe?.()
      unwatch?.()
    }
  }, [initialized, options, onFetch, controller])

  return {
    data,
    error,
    isLoading,
    onFetch
  }
}

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
  enabled?: boolean
}

// -- hook ------------------------------------------------------ //
export function useStatefullAsyncController<S, O extends Options>(
  controller: Controller<S, O>,
  options?: O
) {
  const [data, setData] = useState(controller.state)
  const [error, setError] = useState<Error | undefined>(undefined)
  const [isLoading, setIsLoading] = useState(true)
  const initialized = useClientInitialized()
  const watch = options?.watch ?? false
  const enabled = typeof options?.enabled === 'undefined' ? true : options.enabled
  const ready = initialized && enabled

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
    if (ready) {
      unsubscribe = controller.subscribe(newData => setData({ ...newData }))
      if (watch) unwatch = controller.watch(options)
      else onFetch()
    }

    return () => {
      unsubscribe?.()
      unwatch?.()
    }
  }, [watch, ready, options, controller, onFetch])

  useEffect(() => {
    if (!enabled || watch) setIsLoading(false)
  }, [enabled, watch])

  return {
    data,
    error,
    isLoading,
    onFetch
  }
}

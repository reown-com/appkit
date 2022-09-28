import { useCallback, useEffect, useState } from 'react'
import { useClientInitialized } from '../data/useClientInitialized'

interface DataController<S, A> {
  state: S
  fetch: (args?: A) => Promise<void>
  watch: () => () => void
  subscribe: (callback: (newData: S) => void) => () => void
}

interface Options {
  watch?: boolean
}

export function useWatchableAsyncData<S, A>(controller: DataController<S, A>, options?: Options) {
  const [data, setData] = useState(controller.state)
  const [error, setError] = useState<Error | undefined>(undefined)
  const [isLoading, setIsLoading] = useState(false)
  const initialized = useClientInitialized()
  const watch = options?.watch ?? false

  const onAction = useCallback(async () => {
    try {
      setIsLoading(true)
      await controller.fetch()
      setError(undefined)
    } catch (err: unknown) {
      if (err instanceof Error) setError(err)
      else setError(new Error('Unknown error'))
    } finally {
      setIsLoading(false)
    }
  }, [controller])

  useEffect(() => {
    if (initialized) onAction()

    const unsubscribe = initialized
      ? controller.subscribe(newData => setData({ ...newData }))
      : undefined
    const unwatch = initialized && watch ? controller.watch() : undefined

    return () => {
      unsubscribe?.()
      unwatch?.()
    }
  }, [initialized, controller, watch, onAction])

  return {
    data,
    error,
    isLoading,
    onAction
  }
}

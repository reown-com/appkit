import { useCallback, useEffect, useState } from 'react'
import { useClientInitialized } from '../data/useClientInitialized'

interface DataController<S, O> {
  state: S
  fetch: (args?: ActionOptions<O>) => Promise<void>
  watch: (args?: ActionOptions<O>) => () => void
  subscribe: (callback: (newData: S) => void) => () => void
}

interface Options {
  watch?: boolean
}

type ActionOptions<O> = Omit<O, 'watch'>

export function useWatchableAsyncData<S, O extends Options>(
  controller: DataController<S, O>,
  options?: O
) {
  const [data, setData] = useState(controller.state)
  const [error, setError] = useState<Error | undefined>(undefined)
  const [isLoading, setIsLoading] = useState(false)
  const initialized = useClientInitialized()
  const { watch, ...rest } = options ?? { watch: false }
  const initialOptions = Object.values(rest).length ? (rest as ActionOptions<O>) : undefined

  const onAction = useCallback(
    async (actionOptions?: ActionOptions<O>) => {
      try {
        setIsLoading(true)
        await controller.fetch(actionOptions)
        setError(undefined)
      } catch (err: unknown) {
        if (err instanceof Error) setError(err)
        else setError(new Error('Unknown error'))
      } finally {
        setIsLoading(false)
      }
    },
    [controller]
  )

  useEffect(() => {
    let unwatch: (() => void) | undefined = undefined
    let unsubscribe: (() => void) | undefined = undefined
    if (initialized) {
      unsubscribe = controller.subscribe(newData => setData({ ...newData }))
      onAction(initialOptions)
      if (watch) unwatch = controller.watch(initialOptions)
    }

    return () => {
      unsubscribe?.()
      unwatch?.()
    }
    // Adding initialOptions here causes infinite loop
  }, [initialized, watch, controller, onAction])

  return {
    data,
    error,
    isLoading,
    onAction
  }
}

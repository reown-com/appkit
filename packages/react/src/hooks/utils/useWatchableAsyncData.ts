import { useCallback, useEffect, useState } from 'react'
import { useClientInitialized } from '../data/useClientInitialized'

interface DataController<S, A> {
  state: S
  fetch: (args?: A) => Promise<void>
  watch: () => () => void
  subscribe: (callback: (newData: S) => void) => () => void
}

interface Options<A> {
  watch?: boolean
  args?: A
}

export function useWatchableAsyncData<S, A>(
  controller: DataController<S, A>,
  options?: Options<A>
) {
  const [data, setData] = useState(controller.state)
  const [error, setError] = useState<Error | undefined>(undefined)
  const [isLoading, setIsLoading] = useState(false)
  const initialized = useClientInitialized()

  const onAction = useCallback(
    async (args?: A) => {
      try {
        setIsLoading(true)
        await controller.fetch(args)
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
    let unWatch: (() => void) | undefined = undefined
    let unSubscribe: (() => void) | undefined = undefined
    if (initialized) {
      unSubscribe = controller.subscribe(newData => setData({ ...newData }))
      onAction(options?.args)
      if (options?.watch) unWatch = controller.watch()
    }

    return () => {
      unSubscribe?.()
      unWatch?.()
    }
  }, [initialized, controller, options, onAction])

  return {
    data,
    error,
    isLoading,
    onAction
  }
}

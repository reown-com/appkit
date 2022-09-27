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
  const watch = options?.watch ?? false
  const args = options?.args ?? undefined

  const onAction = useCallback(
    async (argums?: A) => {
      try {
        setIsLoading(true)
        await controller.fetch(argums)
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
      onAction(args)
      if (watch) unWatch = controller.watch()
    }

    return () => {
      unSubscribe?.()
      unWatch?.()
    }
  }, [initialized, controller, watch, args, onAction])

  return {
    data,
    error,
    isLoading,
    onAction
  }
}

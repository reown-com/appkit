import { useCallback, useEffect, useState } from 'react'
import { useClientInitialized } from '../data/useClientInitialized'
import { useOptionsChange } from './useOptionsChange'

// -- types ----------------------------------------------------- //
type Arguments<TArgs> = TArgs & {
  enabled?: boolean
  watch?: boolean
}

interface Options<TArgs, TReturn> {
  fetchFn: (args: TArgs) => Promise<TReturn>
  watchFn?: (args: TArgs, callback: (watchData: TReturn) => void) => () => void
  args: Arguments<TArgs>
}

// -- hook ------------------------------------------------------ //
export function useAsyncController<TArgs, TReturn>({
  fetchFn,
  watchFn,
  args
}: Options<TArgs, TReturn>) {
  const { enabled, watch } = args
  const isEnabled = typeof enabled === 'undefined' ? true : enabled
  const [isLoading, setIsLoading] = useState(isEnabled)
  const [isFirstFetch, setIsFirstFetch] = useState(true)
  const [error, setError] = useState<Error | undefined>(undefined)
  const [data, setData] = useState<TReturn | undefined>(undefined)
  const initialized = useClientInitialized()
  const ready = initialized && isEnabled

  const onFetch = useCallback(
    async (newArgs?: TArgs) => {
      let newData: TReturn | undefined = undefined

      if (!isLoading || isFirstFetch) {
        setIsFirstFetch(false)
        setIsLoading(true)
        try {
          newData = await fetchFn(newArgs ?? args)
          setData(newData)
          setError(undefined)
        } catch (err: unknown) {
          if (err instanceof Error) setError(err)
          else setError(new Error('Unknown error'))
          setData(undefined)
        } finally {
          setIsLoading(false)
        }
      }

      return newData
    },
    [fetchFn, args, isLoading, isFirstFetch]
  )

  // Initial fetch
  useEffect(() => {
    if (ready && isFirstFetch) onFetch()
  }, [ready, isFirstFetch, onFetch])

  // Set up watcher after initial fetch if it is enabled
  useEffect(() => {
    let unwatch: (() => void) | undefined = undefined
    if (watch && !isFirstFetch && watchFn) unwatch = watchFn(args, newData => setData(newData))

    return () => {
      unwatch?.()
    }
  }, [watch, isFirstFetch, args, watchFn])

  // Re-fetch when input args change
  useOptionsChange(() => {
    if (!watch && !isFirstFetch) onFetch()
  }, args)

  return {
    data,
    onFetch,
    isLoading,
    error
  }
}

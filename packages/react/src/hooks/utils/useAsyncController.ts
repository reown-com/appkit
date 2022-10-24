import { CoreHelpers } from '@web3modal/core'
import { useCallback, useEffect, useState } from 'react'
import { useClientInitialized } from '../data/useClientInitialized'
import { useOptionsChange } from './useOptionsChange'

// -- types ----------------------------------------------------- //
type Nullable<TReturn> = TReturn | null

type Arguments<TArgs> = TArgs & {
  enabled?: boolean
  watch?: boolean
}

interface Options<TArgs, TReturn> {
  fetchFn: (args: TArgs) => Promise<Nullable<TReturn>>
  watchFn?: (callback: (watchData: Nullable<TReturn>) => void, args: TArgs) => () => void
  args: Arguments<TArgs>
  hasRequiredArgs?: boolean
}

// -- hook ------------------------------------------------------ //
export function useAsyncController<TArgs, TReturn>({
  fetchFn,
  watchFn,
  args,
  hasRequiredArgs
}: Options<TArgs, TReturn>) {
  const { enabled, watch } = args
  const isEnabled = typeof enabled === 'undefined' ? true : enabled
  const isRequiredArgs = typeof hasRequiredArgs === 'undefined' ? true : hasRequiredArgs
  const [isLoading, setIsLoading] = useState(isEnabled && isRequiredArgs)
  const [isFirstFetch, setIsFirstFetch] = useState(true)
  const [error, setError] = useState<Error | undefined>(undefined)
  const [data, setData] = useState<TReturn | undefined>(undefined)
  const initialized = useClientInitialized()
  const ready = initialized && isEnabled && isRequiredArgs

  const onFetch = useCallback(
    async (newArgs?: TArgs) => {
      let newData: Nullable<TReturn> | undefined = undefined

      if (!isLoading || isFirstFetch) {
        setIsFirstFetch(false)
        setIsLoading(true)
        try {
          newData = await fetchFn(newArgs ?? args)
          if (!CoreHelpers.isNull(newData)) {
            setData(newData)
            setError(undefined)
            setIsLoading(false)
          }
        } catch (err: unknown) {
          if (err instanceof Error) setError(err)
          else setError(new Error('Unknown error'))
          setData(undefined)
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
    if (watch && !isFirstFetch && watchFn)
      unwatch = watchFn(newData => {
        if (CoreHelpers.isNull(newData)) setData(undefined)
        else {
          setData(newData)
          setIsLoading(false)
        }
      }, args)

    return () => {
      unwatch?.()
    }
  }, [watch, isFirstFetch, args, watchFn])

  // Re-fetch when input args change
  useOptionsChange(() => {
    if (!watch && !isFirstFetch && ready) onFetch()
  }, args)

  return {
    data,
    onFetch,
    isLoading,
    error
  }
}

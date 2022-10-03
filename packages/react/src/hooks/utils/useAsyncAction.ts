import { useCallback, useState } from 'react'
import { useClientInitialized } from '../data/useClientInitialized'
import { useOptionsChange } from './useOptionsChange'

type Arguments<TArgs> = TArgs & {
  enabled?: boolean
}

export function useAsyncAction<TArgs, TResult>(
  action: (args: TArgs) => Promise<TResult>,
  args: Arguments<TArgs>
) {
  const enabled = typeof args.enabled === 'undefined' ? true : args.enabled
  const [isLoading, setIsLoading] = useState(enabled)
  const [isFirstFetch, setIsFirstFetch] = useState(true)
  const [error, setError] = useState<Error | undefined>(undefined)
  const [data, setData] = useState<TResult | undefined>(undefined)
  const initialized = useClientInitialized()
  const ready = initialized && enabled

  const onAction = useCallback(
    async (newArgs?: TArgs) => {
      if (!isLoading || isFirstFetch) {
        setIsFirstFetch(false)
        setIsLoading(true)
        try {
          const newData = await action(newArgs ?? args)
          setData(newData)
          setError(undefined)
        } catch (err: unknown) {
          if (err instanceof Error) setError(err)
          else setError(new Error('Unknown error'))
        } finally {
          setIsLoading(false)
        }
      }
    },
    [action, args, isLoading, isFirstFetch]
  )

  // Re-fetch when input options change
  useOptionsChange(() => {
    if (ready) onAction()
  }, args)

  return {
    data,
    onAction,
    isLoading,
    error
  }
}

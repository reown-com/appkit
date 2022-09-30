import { useCallback, useEffect, useState } from 'react'
import { useOptionsChange } from '../utils/useOptionsChange'

type Arguments<TArgs> = TArgs & {
  enabled?: boolean
}

export function useAsyncAction<TArgs, TResult>(
  action: (args: TArgs) => Promise<TResult>,
  args: Arguments<TArgs>
) {
  const enabled = typeof args.enabled === 'undefined' ? true : args.enabled
  const [isLoading, setIsLoading] = useState(false)
  const [initial, setInitial] = useState(true)
  const [error, setError] = useState<Error | undefined>(undefined)
  const [data, setData] = useState<TResult | undefined>(undefined)

  const onAction = useCallback(
    async (newArgs?: TArgs) => {
      try {
        setIsLoading(true)
        const newData = await action(newArgs ?? args)
        setData(newData)
        setError(undefined)
      } catch (err: unknown) {
        if (err instanceof Error) setError(err)
        else setError(new Error('Unknown error'))
      } finally {
        setIsLoading(false)
      }
    },
    [action, args]
  )

  useEffect(() => {
    if (initial && enabled) onAction()
    setInitial(false)
  }, [onAction, enabled, initial])

  useOptionsChange(() => {
    if (!initial && enabled) onAction()
  }, args)

  return {
    data,
    onAction,
    isLoading,
    error
  }
}

import { useCallback, useEffect, useState } from 'react'

export function useAsyncHookBuilder<TArgs, TResult>(
  action: (args: TArgs) => Promise<TResult>,
  initialArgs: TArgs
) {
  const [data, setData] = useState<TResult | undefined>(undefined)
  const [error, setError] = useState<Error | undefined>(undefined)
  const [isLoading, setIsLoading] = useState(false)

  const onAction = useCallback(
    async (args: TArgs) => {
      try {
        setIsLoading(true)
        const actionData = await action(args)
        setData(actionData)
        setError(undefined)
      } catch (err: unknown) {
        if (err instanceof Error) setError(err)
        else setError(new Error('Unknown error'))
        setData(undefined)
      } finally {
        setIsLoading(false)
      }
    },
    [action]
  )

  useEffect(() => {
    onAction(initialArgs)
  }, [])

  return {
    data,
    error,
    onAction,
    isLoading
  }
}

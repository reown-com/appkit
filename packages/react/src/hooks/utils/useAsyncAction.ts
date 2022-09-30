import { useState } from 'react'

export function useAsyncAction<TArgs, TResult>(
  action: (args: TArgs) => Promise<TResult>,
  args: TArgs
) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | undefined>(undefined)
  const [data, setData] = useState<TResult | undefined>(undefined)

  async function onAction(newArgs?: TArgs) {
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
  }

  return {
    data,
    onAction,
    isLoading,
    error
  }
}

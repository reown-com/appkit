import { useCallback, useEffect, useState } from 'react'

export function useAsyncHookBuilder<TArgs, TResult>(
  action: (options: TArgs) => Promise<TResult>,
  initialOptions: TArgs
) {
  const [data, setData] = useState<TResult | null>(null)
  const [error, setError] = useState<unknown>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isError, setIsError] = useState<boolean>(false)
  const [isSuccess, setIsSuccess] = useState<boolean>(false)

  const callAction = useCallback(
    async (options: TArgs) => {
      try {
        setIsLoading(true)
        const fetchedData = await action(options)
        setData(fetchedData)
        setIsError(false)
        setError(null)
        setIsSuccess(true)
      } catch (err: unknown) {
        setError(err)
        setIsError(true)
        setIsSuccess(false)
      } finally {
        setIsLoading(false)
      }
    },
    [action]
  )

  useEffect(() => {
    callAction(initialOptions)
  }, [])

  return {
    data,
    error,
    callAction,
    isLoading,
    isSuccess,
    isError
  }
}

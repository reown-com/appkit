import { useCallback, useEffect, useState } from 'react'

export function useAsyncHookBuilder<TArgs, TResult>(
  fetcher: (opts: TArgs) => Promise<TResult>,
  initialOpts?: TArgs
) {
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<unknown>(null)
  const [data, setData] = useState<TResult | null>(null)

  const refetch = useCallback(
    async (opts: TArgs) => {
      try {
        setIsLoading(true)
        const fetchedData = await fetcher(opts)
        setData(fetchedData)
      } catch (err: unknown) {
        return setError(err)
      } finally {
        setIsLoading(false)
      }
    },
    [fetcher, setError, setIsLoading, setData]
  )

  useEffect(() => {
    if (initialOpts) refetch(initialOpts)
  }, [initialOpts, refetch])

  return {
    data,
    refetch,
    isLoading,
    error
  }
}

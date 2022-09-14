import { useCallback, useEffect, useState } from 'react'

export function useAsyncHookBuilder<TArgs, TResult>(
  fetcher: (opts: TArgs) => Promise<TResult>,
  initialOpts?: TArgs
) {
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<unknown>(null)
  const [data, setData] = useState<TResult | null>(null)
  const [fetchedInitial, setFetchedInitial] = useState<boolean>(false)

  const refetch = useCallback(
    async (opts: TArgs) => {
      try {
        setIsLoading(true)
        const fetchedData = await fetcher(opts)
        setData(fetchedData)
      } catch (err: unknown) {
        setError(err)
      } finally {
        setIsLoading(false)
      }
    },
    [fetcher, setError, setIsLoading, setData]
  )

  useEffect(() => {
    if (initialOpts && !fetchedInitial)
      refetch(initialOpts).then(() => {
        setFetchedInitial(true)
      })
  }, [initialOpts, refetch, setFetchedInitial, fetchedInitial])

  return {
    data,
    refetch,
    isLoading,
    error
  }
}

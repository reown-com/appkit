import { useState } from 'react'

export function useAsyncHookBuilder<TArgs, TResult>(fetcher: (opts: TArgs) => Promise<TResult>) {
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<unknown>(null)
  const [data, setData] = useState<TResult | null>(null)

  async function refetch(opts: TArgs) {
    try {
      setIsLoading(true)
      const fetchedData = await fetcher(opts)
      setData(fetchedData)
    } catch (err: unknown) {
      return setError(err)
    } finally {
      setIsLoading(false)
    }
  }

  return {
    data,
    refetch,
    isLoading,
    error
  }
}

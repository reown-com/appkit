import { useState } from 'react'

export function useSyncHookBuilder<TArgs, TResult>(fetcher: (opts: TArgs) => TResult) {
  const [error, setError] = useState<unknown>(null)
  const [data, setData] = useState<TResult | null>(null)

  function refetch(opts: TArgs) {
    try {
      const fetchedData = fetcher(opts)
      setData(fetchedData)
    } catch (err: unknown) {
      return setError(err)
    }
  }

  return {
    data,
    refetch,
    error
  }
}

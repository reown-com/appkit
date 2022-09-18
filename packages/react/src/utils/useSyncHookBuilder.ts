import { useEffect, useState } from 'react'

export function useSyncHookBuilder<TArgs, TResult>(
  fetcher: (opts: TArgs) => TResult,
  initialOpts?: TArgs
) {
  const [error, setError] = useState<unknown>(null)
  const [data, setData] = useState<TResult | null>(null)
  const [fetchedInitial, setFetchedInitial] = useState<boolean>(false)

  function refetch(opts: TArgs) {
    try {
      const fetchedData = fetcher(opts)
      setData(fetchedData)
    } catch (err: unknown) {
      return setError(err)
    }
  }

  useEffect(() => {
    if (fetchedInitial || !initialOpts) return
    const fetchedData = fetcher(initialOpts)
    setData(fetchedData)
    setFetchedInitial(true)
  }, [fetchedInitial, initialOpts, setData, setFetchedInitial, fetcher])

  return {
    data,
    refetch,
    error
  }
}

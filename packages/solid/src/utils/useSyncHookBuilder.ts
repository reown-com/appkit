import { createEffect, createSignal } from 'solid-js'

export function useSyncHookBuilder<TArgs, TResult>(
  fetcher: (opts: TArgs) => TResult,
  initialOpts?: TArgs
) {
  const [error, setError] = createSignal<unknown>(null)
  const [data, setData] = createSignal<TResult | null>(null)
  const [fetchedInitial, setFetchedInitial] = createSignal<boolean>(false)

  function refetch(opts: TArgs) {
    try {
      const fetchedData = fetcher(opts)
      setData(() => fetchedData)
      setError(() => '')
    } catch (err: unknown) {
      setError(() => err)
    }
  }

  createEffect(() => {
    if (fetchedInitial() || !initialOpts) return
    const fetchedData = fetcher(initialOpts)
    setData(() => fetchedData)
    setFetchedInitial(true)
  })

  return {
    data,
    refetch,
    error
  }
}

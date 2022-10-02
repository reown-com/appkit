import { createEffect, createSignal } from 'solid-js'

export function useAsyncHookBuilder<TArgs, TResult>(
  fetcher: (opts: TArgs) => Promise<TResult>,
  initialOpts?: TArgs
) {
  const [isLoading, setIsLoading] = createSignal<boolean>(false)
  const [error, setError] = createSignal<unknown>(null)
  const [data, setData] = createSignal<TResult | null>(null)
  const [fetchedInitial, setFetchedInitial] = createSignal<boolean>(false)

  async function refetch(opts: TArgs) {
    try {
      setIsLoading(true)
      const fetchedData = await fetcher(opts)
      setData(() => fetchedData)
    } catch (err: unknown) {
      setError(err)
    } finally {
      setIsLoading(false)
    }
  }

  createEffect(() => {
    if (initialOpts && !fetchedInitial())
      refetch(initialOpts).then(() => {
        setFetchedInitial(true)
      })
  })

  return {
    data,
    refetch,
    isLoading,
    error
  }
}

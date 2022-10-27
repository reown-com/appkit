import { createEffect, createSignal, onCleanup } from 'solid-js'
import { useClientInitialized } from '../data/useClientInitialized'
import { useOptionsChange } from './useOptionsChange'

// -- types ----------------------------------------------------- //
type Arguments<TArgs> = TArgs & {
  enabled?: boolean
  watch?: boolean
}

interface Options<TArgs, TReturn> {
  fetchFn: (args: TArgs) => Promise<TReturn>
  watchFn?: (args: TArgs, callback: (watchData: TReturn) => void) => () => void
  args: Arguments<TArgs>
}

// -- hook ------------------------------------------------------ //
export function useAsyncController<TArgs, TReturn>({
  fetchFn,
  watchFn,
  args
}: Options<TArgs, TReturn>) {
  const { enabled, watch } = args
  const isEnabled = typeof enabled === 'undefined' ? true : enabled
  const [isLoading, setIsLoading] = createSignal(isEnabled)
  const [isFirstFetch, setIsFirstFetch] = createSignal(true)
  const [error, setError] = createSignal<Error | undefined>(undefined)
  const [data, setData] = createSignal<TReturn | undefined>(undefined)
  const initialized = useClientInitialized()
  const ready = initialized() && isEnabled

  async function onFetch(newArgs?: TArgs) {
    let newData: TReturn | undefined = undefined

    if (!isLoading() || isFirstFetch()) {
      setIsFirstFetch(false)
      setIsLoading(true)
      try {
        newData = await fetchFn(newArgs ?? args)
        setData(() => newData)
        setError(() => undefined)
      } catch (err: unknown) {
        if (err instanceof Error) setError(err)
        else setError(() => new Error('Unknown error'))
        setData(() => undefined)
      } finally {
        setIsLoading(() => false)
      }
    }

    return newData
  }

  // Initial fetch
  createEffect(() => {
    if (ready && isFirstFetch()) onFetch()
  })

  // Set up watcher after initial fetch if it is enabled
  let unwatch: (() => void) | undefined = undefined
  createEffect(() => {
    if (watch && !isFirstFetch() && watchFn)
      unwatch = watchFn(args, newData => setData(() => newData))
  })
  onCleanup(() => unwatch?.())

  // Re-fetch when input args change
  useOptionsChange(() => {
    if (!watch && !isFirstFetch()) onFetch()
  }, args)

  return {
    data,
    onFetch,
    isLoading,
    error
  }
}

import { createEffect, createMemo, createSignal, onCleanup } from 'solid-js'
import { useClientInitialized } from '../data/useClientInitialized'

// -- types ----------------------------------------------------- //
interface Options<TArgs, TReturn> {
  getFn: (args: TArgs) => TReturn
  watchFn?: (options: TArgs, callback: (watchData: TReturn) => void) => () => void
  args: TArgs
}

// -- hook ------------------------------------------------------ //
export function useController<TArgs, TReturn>({ getFn, watchFn, args }: Options<TArgs, TReturn>) {
  const [data, setData] = createSignal<TReturn | undefined>(undefined)
  const initialized = useClientInitialized()

  // We can't use raw args here as that will cause infinite-loop inside createEffect
  const memoArgs = createMemo(() => args, [JSON.stringify(args)])

  let unwatch: (() => void) | undefined = undefined
  createEffect(() => {
    if (initialized()) {
      const getData = getFn(memoArgs())
      setData(() => getData)
      if (watchFn) unwatch = watchFn(memoArgs(), watchData => setData(() => watchData))
    }
  })
  onCleanup(() => unwatch?.())

  return data
}

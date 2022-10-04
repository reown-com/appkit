import { useEffect, useState } from 'react'
import { useClientInitialized } from '../data/useClientInitialized'

// -- types ----------------------------------------------------- //
interface Options<TArgs, TReturn> {
  getFn: (args: TArgs) => TReturn
  watchFn?: (options: TArgs, callback: (watchData: TReturn) => void) => () => void
  args: TArgs
}

// -- hook ------------------------------------------------------ //
export function useController<TArgs, TReturn>({ getFn, watchFn, args }: Options<TArgs, TReturn>) {
  const [data, setData] = useState<TReturn | undefined>(undefined)
  const initialized = useClientInitialized()

  useEffect(() => {
    let unwatch: (() => void) | undefined = undefined
    if (initialized) {
      const getData = getFn(args)
      setData(getData)
      unwatch = watchFn?.(args, watchData => setData(watchData))
    }

    return () => {
      unwatch?.()
    }
  }, [initialized, getFn, watchFn, args])

  return { data }
}

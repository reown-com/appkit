import { CoreHelpers } from '@web3modal/core'
import { useEffect, useMemo, useState } from 'react'
import { useClientInitialized } from '../data/useClientInitialized'

// -- types ----------------------------------------------------- //
type Nullable<TReturn> = TReturn | null

interface Options<TArgs, TReturn> {
  getFn: (args: TArgs) => Nullable<TReturn>
  watchFn?: (options: TArgs, callback: (watchData: Nullable<TReturn>) => void) => () => void
  args: TArgs
}

// -- hook ------------------------------------------------------ //
export function useController<TArgs, TReturn>({ getFn, watchFn, args }: Options<TArgs, TReturn>) {
  const [data, setData] = useState<TReturn | undefined>(undefined)
  const initialized = useClientInitialized()

  // We can't use raw args here as that will cause infinite-loop inside useEffect
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const memoArgs = useMemo(() => args, [JSON.stringify(args)])

  useEffect(() => {
    let unwatch: (() => void) | undefined = undefined
    if (initialized) {
      const getData = getFn(memoArgs)
      setData(CoreHelpers.isNull(getData) ? undefined : getData)
      if (watchFn)
        unwatch = watchFn(memoArgs, watchData =>
          setData(CoreHelpers.isNull(watchData) ? undefined : watchData)
        )
    }

    return () => {
      unwatch?.()
    }
  }, [initialized, memoArgs, getFn, watchFn])

  return { data }
}

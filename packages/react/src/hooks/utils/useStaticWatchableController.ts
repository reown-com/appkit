import { useCallback, useEffect, useState } from 'react'
import { useClientInitialized } from '../data/useClientInitialized'

// -- types ----------------------------------------------------- //
interface Controller<TReturn, TOptions> {
  get: (options: TOptions) => TReturn
  watch: (options: TOptions, callback: (data: TReturn) => void) => () => void
}

interface Options {
  chainId?: number
}

// -- hook ------------------------------------------------------ //
export function useStaticWatchableController<TReturn, TOptions extends Options>(
  controller: Controller<TReturn, TOptions>,
  options: TOptions
) {
  const [data, setData] = useState<TReturn | undefined>(undefined)
  const initialized = useClientInitialized()

  const onGet = useCallback(() => {
    const newData = controller.get(options)
    setData(newData)
  }, [controller, options])

  useEffect(() => {
    let unwatch: (() => void) | undefined = undefined
    if (initialized) {
      onGet()
      unwatch = controller.watch(options, newData => setData(newData))
    }

    return () => {
      unwatch?.()
    }
  }, [initialized, options, controller, onGet])

  return data
}

import { useCallback, useEffect, useState } from 'react'
import { useClientInitialized } from '../data/useClientInitialized'

// -- types ----------------------------------------------------- //
interface Controller<R, O> {
  get: (args: O) => R
  watch: (args: O, callback: (data: R) => void) => () => void
}

interface Options {
  chainId?: number
}

// -- hook ------------------------------------------------------ //
export function useStaticWatchableController<R, O extends Options>(
  controller: Controller<R, O>,
  options: O
) {
  const [data, setData] = useState<R | undefined>(undefined)
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

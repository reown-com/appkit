import { useEffect, useState } from 'react'
import { useClientInitialized } from '../data/useClientInitialized'

interface DataController<S> {
  state: S
  get: () => void
  watch: () => () => void
  subscribe: (callback: (newData: S) => void) => () => void
}

interface Options {
  watch?: boolean
}

export function useWatchableData<S>(controller: DataController<S>, options?: Options) {
  const [data, setData] = useState(controller.state)
  const initialized = useClientInitialized()
  const watch = options?.watch ?? false

  useEffect(() => {
    let unwatch: (() => void) | undefined = undefined
    let unsubscribe: (() => void) | undefined = undefined
    if (initialized) {
      unsubscribe = controller.subscribe(newData => setData({ ...newData }))
      controller.get()
      if (watch) unwatch = controller.watch()
    }

    return () => {
      unsubscribe?.()
      unwatch?.()
    }
  }, [initialized, watch, controller])

  return data
}

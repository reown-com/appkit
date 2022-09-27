import { useEffect, useState } from 'react'
import { useClientInitialized } from '../data/useClientInitialized'

interface DataController<S> {
  state: S
  get: () => void
  watch: () => () => void
  subscribe: (callback: (newData: S) => void) => () => void
}

export function useWatchableData<S>(controller: DataController<S>, watch?: boolean) {
  const [data, setData] = useState(controller.state)
  const initialized = useClientInitialized()

  useEffect(() => {
    let unWatch: (() => void) | undefined = undefined
    let unSubscribe: (() => void) | undefined = undefined
    if (initialized) {
      unSubscribe = controller.subscribe(newData => setData({ ...newData }))
      controller.get()
      if (watch) unWatch = controller.watch()
    }

    return () => {
      unSubscribe?.()
      unWatch?.()
    }
  }, [initialized, controller, watch])

  return data
}

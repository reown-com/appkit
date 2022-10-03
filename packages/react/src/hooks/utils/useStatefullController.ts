import { useEffect, useState } from 'react'
import { useClientInitialized } from '../data/useClientInitialized'

// -- types ----------------------------------------------------- //
interface Controller<TReturn> {
  get: () => TReturn
  watch: (callback: (watchData: TReturn) => void) => () => void
}

// -- hook ------------------------------------------------------ //
export function useStatefullController<TReturn>(controller: Controller<TReturn>) {
  const [data, setData] = useState<TReturn | undefined>(undefined)
  const initialized = useClientInitialized()

  useEffect(() => {
    let unwatch: (() => void) | undefined = undefined
    if (initialized) {
      const getData = controller.get()
      setData({ ...getData })
      unwatch = controller.watch(watchData => setData({ ...watchData }))
    }

    return () => {
      unwatch?.()
    }
  }, [initialized, controller])

  return { data }
}

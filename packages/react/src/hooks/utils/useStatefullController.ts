import { useEffect, useState } from 'react'
import { useClientInitialized } from '../data/useClientInitialized'

// -- types ----------------------------------------------------- //
interface Controller<TState> {
  state: TState
  get: () => void
  watch: () => () => void
  subscribe: (callback: (newData: TState) => void) => () => void
}

// -- hook ------------------------------------------------------ //
export function useStatefullController<TState>(controller: Controller<TState>) {
  const [data, setData] = useState(controller.state)
  const initialized = useClientInitialized()

  useEffect(() => {
    let unwatch: (() => void) | undefined = undefined
    let unsubscribe: (() => void) | undefined = undefined
    if (initialized) {
      unsubscribe = controller.subscribe(newData => setData({ ...newData }))
      controller.get()
      unwatch = controller.watch()
    }

    return () => {
      unsubscribe?.()
      unwatch?.()
    }
  }, [initialized, controller])

  return data
}

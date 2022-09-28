import { CoreHelpers } from '@web3modal/core'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useClientInitialized } from '../data/useClientInitialized'

// -- types ----------------------------------------------------- //
interface Controller<S, O> {
  state: S
  fetch: (args?: ActionOptions<O>) => Promise<void>
  watch: (args?: ActionOptions<O>) => () => void
  subscribe: (callback: (newData: S) => void) => () => void
}

interface Options {
  watch?: boolean
}

type ActionOptions<O> = Omit<O, 'watch'>

// -- hook ------------------------------------------------------ //
export function useStatefullAsyncController<S, O extends Options>(
  controller: Controller<S, O>,
  options?: O
) {
  const [data, setData] = useState(controller.state)
  const [error, setError] = useState<Error | undefined>(undefined)
  const [isLoading, setIsLoading] = useState(false)
  const { watch, ...rest } = options ?? { watch: false }
  const optRef = useRef(CoreHelpers.isEmptyObject(rest) ? undefined : (rest as ActionOptions<O>))
  const initialized = useClientInitialized()

  const onFetch = useCallback(async () => {
    try {
      setIsLoading(true)
      await controller.fetch(optRef.current)
      setError(undefined)
    } catch (err: unknown) {
      if (err instanceof Error) setError(err)
      else setError(new Error('Unknown error'))
    } finally {
      setIsLoading(false)
    }
  }, [controller])

  useEffect(() => {
    let unwatch: (() => void) | undefined = undefined
    let unsubscribe: (() => void) | undefined = undefined
    if (initialized) {
      unsubscribe = controller.subscribe(newData => setData({ ...newData }))
      onFetch()
      if (watch) unwatch = controller.watch(optRef.current)
    }

    return () => {
      unsubscribe?.()
      unwatch?.()
    }
  }, [initialized, watch, onFetch, controller])

  return {
    data,
    error,
    isLoading,
    onFetch
  }
}

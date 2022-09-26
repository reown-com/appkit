import { useEffect, useState } from 'react'
import { useClientInitialized } from './useClientInitialized'

export function useData() {
  const [unwatch, setUnwatch] = useState<(() => void) | undefined>(undefined)
  const [unsubscribe, setUnsubscribe] = useState<(() => void) | undefined>(undefined)
  const initialized = useClientInitialized()

  useEffect(() => {
    return () => {
      unwatch?.()
      unsubscribe?.()
    }
  }, [unsubscribe, unwatch])

  return { setUnwatch, setUnsubscribe, initialized }
}

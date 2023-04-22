import type { ModalEvent } from '@web3modal/core'
import { EventsCtrl } from '@web3modal/core'
import { useEffect } from 'react'

export function useWeb3ModalEvents(callback: (event: ModalEvent) => void) {
  useEffect(() => {
    const unsubscribe = EventsCtrl.subscribe(callback)

    return () => {
      unsubscribe()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
}

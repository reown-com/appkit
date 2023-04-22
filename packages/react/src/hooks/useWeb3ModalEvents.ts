import type { ModalEvent } from '@web3modal/core'
import { EventsCtrl } from '@web3modal/core'
import { useEffect } from 'react'

export function useWeb3ModalEvents(callback: (event: ModalEvent) => void) {
  useEffect(() => {
    const unsubscribe = EventsCtrl.subscribe(newEvent => callback(newEvent))

    return () => {
      unsubscribe()
    }
  }, [callback])
}

import { useEffect } from 'react'
import { getWeb3ModalSignClient } from '../client'

export function useOnSessionDelete(callback: () => void) {
  useEffect(() => {
    getWeb3ModalSignClient().then(client => {
      client.onSessionDelete(callback)
    })

    return () => {
      getWeb3ModalSignClient().then(client => {
        client.offSessionDelete(callback)
      })
    }
  }, [callback])
}

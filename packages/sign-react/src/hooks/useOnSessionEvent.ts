import type { Web3ModalEventCallback } from '@web3modal/sign-html'
import { useEffect } from 'react'
import { getWeb3ModalSignClient } from '../client'

export function useOnSessionEvent(callback: Web3ModalEventCallback) {
  useEffect(() => {
    getWeb3ModalSignClient().then(client => {
      client.onSessionEvent(callback)
    })

    return () => {
      getWeb3ModalSignClient().then(client => {
        client.offSessionEvent(callback)
      })
    }
  }, [callback])
}

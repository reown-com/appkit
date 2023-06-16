import type { Web3ModalEventCallback } from '@web3modal/sign-html'
import { useEffect } from 'react'
import { getWeb3ModalSignClient } from '../client'

export function useOnSessionUpdate(callback: Web3ModalEventCallback) {
  useEffect(() => {
    getWeb3ModalSignClient().then(client => {
      client.onSessionUpdate(callback)
    })

    return () => {
      getWeb3ModalSignClient().then(client => {
        client.offSessionUpdate(callback)
      })
    }
  }, [callback])
}

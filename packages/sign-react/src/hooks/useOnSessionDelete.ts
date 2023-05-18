import type { Web3ModalEventCallback } from '@web3modal/sign-html'
import { useEffect } from 'react'
import { getWeb3ModalSignClient } from '../client'

export function useOnSessionDelete(callback: Web3ModalEventCallback) {
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

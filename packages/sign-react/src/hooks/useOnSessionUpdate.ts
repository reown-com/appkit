import type { Web3ModalEventCallback } from '@web3modal/sign-html'
import { useEffect } from 'react'
import { getWeb3ModalSignClient } from '../client'

export function useOnSessionUpdate<Event>(callback: Web3ModalEventCallback<Event>) {
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

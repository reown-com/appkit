import { useEffect, useState } from 'react'
import type { Web3ModalSignInstance } from '../client'
import { getWeb3ModalSignClient } from '../client'
import { useOnSessionDelete } from './useOnSessionDelete'
import { useOnSessionUpdate } from './useOnSessionUpdate'

type Data = Awaited<ReturnType<Web3ModalSignInstance['getActiveSession']>>

export function useActiveSession() {
  const [session, setSession] = useState<Data | undefined>(undefined)

  useOnSessionDelete(event => {
    if (event.topic === session?.topic) {
      setSession(undefined)
    }
  })

  // TODO: session creation, update state

  useOnSessionUpdate(event => {
    if (session && event.topic === session?.topic) {
      const { namespaces } = event.params
      const updatedSession = { ...session, namespaces }
      setSession(updatedSession)
    }
  })

  useEffect(() => {
    async function getActiveSession() {
      const client = await getWeb3ModalSignClient()
      const response = await client.getActiveSession()
      setSession(response)
    }

    getActiveSession()
  }, [])

  return session
}

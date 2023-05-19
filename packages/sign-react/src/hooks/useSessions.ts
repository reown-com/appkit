import { useEffect, useState } from 'react'
import type { Web3ModalSignInstance } from '../client'
import { getWeb3ModalSignClient } from '../client'

type Data = Awaited<ReturnType<Web3ModalSignInstance['getSessions']>>

export function useSessions() {
  const [sessions, setSessions] = useState<Data | undefined>(undefined)

  useEffect(() => {
    async function getAllSessions() {
      const client = await getWeb3ModalSignClient()
      const response = await client.getSessions()
      setSessions(response)
    }

    getAllSessions()
  }, [])

  return sessions
}

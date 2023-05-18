import { useEffect, useState } from 'react'
import type { Web3ModalSignInstance } from '../client'
import { getWeb3ModalSignClient } from '../client'

type Data = Awaited<ReturnType<Web3ModalSignInstance['getAllSessions']>>

export function useAllSessions() {
  const [sessions, setSessions] = useState<Data | undefined>(undefined)

  useEffect(() => {
    async function getAllSessions() {
      const client = await getWeb3ModalSignClient()
      const response = await client.getAllSessions()
      setSessions(response)
    }

    getAllSessions()
  }, [])

  return sessions
}

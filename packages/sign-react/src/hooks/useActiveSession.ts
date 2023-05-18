import { useEffect, useState } from 'react'
import type { Web3ModalSignInstance } from '../client'
import { getWeb3ModalSignClient } from '../client'

type Data = Awaited<ReturnType<Web3ModalSignInstance['getActiveSession']>>

export function useActiveSession() {
  const [session, setSession] = useState<Data | undefined>(undefined)

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

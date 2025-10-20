import { createContext, useContext, useEffect, useState } from 'react'

import type { SIWXSession } from '@laughingwhales/appkit'
import type { ReownAuthentication } from '@laughingwhales/appkit-siwx'
import { useAppKitSIWX } from '@laughingwhales/appkit-siwx/react'

type SessionContextType = SIWXSession | undefined

const SessionContext = createContext<SessionContextType>(undefined)

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const siwx = useAppKitSIWX<ReownAuthentication>()
  const [value, setValue] = useState<SessionContextType>(undefined)

  useEffect(() => {
    if (!siwx) return

    const unsubscribe = siwx.on('sessionChanged', session => {
      setValue(session)
    })

    return () => {
      unsubscribe()
    }
  }, [siwx])

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
}

export function useSession() {
  return useContext(SessionContext)
}

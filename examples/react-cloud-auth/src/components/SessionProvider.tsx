import { createContext, useContext, useEffect, useState } from 'react'

import type { SIWXSession } from '@reown/appkit'
import type { CloudAuthSIWX } from '@reown/appkit-siwx'
import { useAppKitSIWX } from '@reown/appkit-siwx/react'

type SessionContextType = SIWXSession | undefined

const SessionContext = createContext<SessionContextType>(undefined)

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const siwx = useAppKitSIWX<CloudAuthSIWX>()
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

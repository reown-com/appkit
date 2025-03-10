/* eslint-disable @typescript-eslint/no-redundant-type-constituents */
import React, { type ReactNode } from 'react'
import { createContext } from 'react'

import type { SmartSessionGrantPermissionsResponse } from '@reown/appkit-experimental/smart-session'

import { useLocalStorageState } from '@/src/hooks/useLocalStorageState'
import { SMART_SESSION_KEY, removeLocalStorageItem } from '@/src/utils/LocalStorage'

export type ERC7715PermissionsContextType = {
  projectId: string
  smartSession:
    | {
        grantedPermissions: SmartSessionGrantPermissionsResponse
        type: 'async' | 'sync'
      }
    | undefined
  setSmartSession: React.Dispatch<
    React.SetStateAction<
      | {
          grantedPermissions: SmartSessionGrantPermissionsResponse
          type: 'async' | 'sync'
        }
      | undefined
    >
  >
  clearSmartSession: () => void
}
function noop() {
  console.warn('WagmiPermissionsAsyncContext used outside of provider')
}
export const ERC7715PermissionsContext = createContext<ERC7715PermissionsContextType>({
  projectId: '',
  clearSmartSession: noop,
  smartSession: undefined,
  setSmartSession: noop
})

interface ERC7715PermissionsProviderProps {
  children: ReactNode
}

export function ERC7715PermissionsProvider({ children }: ERC7715PermissionsProviderProps) {
  const projectId = process.env['NEXT_PUBLIC_PROJECT_ID']
  if (!projectId) {
    throw new Error('NEXT_PUBLIC_PROJECT_ID is not set')
  }
  const [smartSession, setSmartSession] = useLocalStorageState<
    | {
        grantedPermissions: SmartSessionGrantPermissionsResponse
        type: 'async' | 'sync'
      }
    | undefined
  >(SMART_SESSION_KEY, undefined)
  function clearSmartSession() {
    removeLocalStorageItem(SMART_SESSION_KEY)
    setSmartSession(undefined)
  }

  return (
    <ERC7715PermissionsContext.Provider
      value={{
        projectId,
        smartSession,
        setSmartSession,
        clearSmartSession
      }}
    >
      {children}
    </ERC7715PermissionsContext.Provider>
  )
}

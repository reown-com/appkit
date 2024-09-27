/* eslint-disable @typescript-eslint/no-redundant-type-constituents */
import React, { type ReactNode } from 'react'
import { createContext } from 'react'
import { GRANTED_PERMISSIONS_KEY, removeLocalStorageItem } from '../utils/LocalStorage'
import { useLocalStorageState } from '../hooks/useLocalStorageState'
import type { SmartSessionGrantPermissionsResponse } from '@reown/appkit-experimental/smart-session'

export type ERC7715PermissionsContextType = {
  projectId: string
  smartSessionResponse:
    | {
        response: SmartSessionGrantPermissionsResponse | undefined
        chainId: number | undefined
      }
    | undefined
  setSmartSessionResponse: React.Dispatch<
    React.SetStateAction<
      | {
          response: SmartSessionGrantPermissionsResponse | undefined
          chainId: number | undefined
        }
      | undefined
    >
  >
  clearSmartSessionResponse: () => void
}
function noop() {
  console.warn('WagmiPermissionsAsyncContext used outside of provider')
}
export const ERC7715PermissionsContext = createContext<ERC7715PermissionsContextType>({
  projectId: '',
  clearSmartSessionResponse: noop,
  smartSessionResponse: undefined,
  setSmartSessionResponse: noop
})

interface ERC7715PermissionsProviderProps {
  children: ReactNode
}

export function ERC7715PermissionsProvider({ children }: ERC7715PermissionsProviderProps) {
  const projectId = process.env['NEXT_PUBLIC_PROJECT_ID']
  if (!projectId) {
    throw new Error('NEXT_PUBLIC_PROJECT_ID is not set')
  }
  const [smartSessionResponse, setSmartSessionResponse] = useLocalStorageState<
    | {
        response: SmartSessionGrantPermissionsResponse | undefined
        chainId: number | undefined
      }
    | undefined
  >(GRANTED_PERMISSIONS_KEY, undefined)
  function clearSmartSessionResponse() {
    removeLocalStorageItem(GRANTED_PERMISSIONS_KEY)
    setSmartSessionResponse(undefined)
  }

  return (
    <ERC7715PermissionsContext.Provider
      value={{
        projectId,
        smartSessionResponse,
        setSmartSessionResponse,
        clearSmartSessionResponse
      }}
    >
      {children}
    </ERC7715PermissionsContext.Provider>
  )
}

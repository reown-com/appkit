import type { ReactNode } from 'react'
import { createContext } from 'react'
import { GRANTED_PERMISSIONS_KEY } from '../utils/LocalStorage'
import { useLocalStorageState } from '../hooks/useLocalStorageState'
import type { GrantPermissionsReturnType } from 'viem/experimental'

interface GrantedPermissionsContextType {
  grantedPermissions: GrantPermissionsReturnType | undefined
  setGrantedPermissions: React.Dispatch<
    React.SetStateAction<GrantPermissionsReturnType | undefined>
  >
}

export const GrantedPermissionsContext = createContext<GrantedPermissionsContextType | undefined>(
  undefined
)

interface GrantedPermissionsProviderProps {
  children: ReactNode
}

export function GrantedPermissionsProvider({ children }: GrantedPermissionsProviderProps) {
  const [grantedPermissions, setGrantedPermissions] = useLocalStorageState<
    GrantPermissionsReturnType | undefined
  >(GRANTED_PERMISSIONS_KEY, undefined)

  return (
    <GrantedPermissionsContext.Provider value={{ grantedPermissions, setGrantedPermissions }}>
      {children}
    </GrantedPermissionsContext.Provider>
  )
}

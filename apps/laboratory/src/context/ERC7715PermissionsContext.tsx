import React, { type ReactNode } from 'react'
import { createContext } from 'react'
import {
  GRANTED_PERMISSIONS_KEY,
  removeLocalStorageItem,
  WC_COSIGNER_DATA
} from '../utils/LocalStorage'
import { useLocalStorageState } from '../hooks/useLocalStorageState'
import type { GrantPermissionsReturnType } from 'viem/experimental'
import type { AddPermissionResponse } from '../utils/WalletConnectCosignerUtils'

export type ERC7715PermissionsContextType = {
  projectId: string
  grantedPermissions: { permissions: GrantPermissionsReturnType; chainId: number } | undefined
  setGrantedPermissions: React.Dispatch<
    React.SetStateAction<{ permissions: GrantPermissionsReturnType; chainId: number } | undefined>
  >
  wcCosignerData: AddPermissionResponse | undefined
  setWCCosignerData: React.Dispatch<React.SetStateAction<AddPermissionResponse | undefined>>
  clearGrantedPermissions: () => void
}
function noop() {
  console.warn('WagmiPermissionsAsyncContext used outside of provider')
}
export const ERC7715PermissionsContext = createContext<ERC7715PermissionsContextType>({
  projectId: '',
  grantedPermissions: undefined,
  wcCosignerData: undefined,
  setGrantedPermissions: noop,
  setWCCosignerData: noop,
  clearGrantedPermissions: noop
})

interface ERC7715PermissionsProviderProps {
  children: ReactNode
}

export function ERC7715PermissionsProvider({ children }: ERC7715PermissionsProviderProps) {
  const projectId = process.env['NEXT_PUBLIC_PROJECT_ID']
  if (!projectId) {
    throw new Error('NEXT_PUBLIC_PROJECT_ID is not set')
  }
  const [grantedPermissions, setGrantedPermissions] = useLocalStorageState<
    { permissions: GrantPermissionsReturnType; chainId: number } | undefined
  >(GRANTED_PERMISSIONS_KEY, undefined)
  const [wcCosignerData, setWCCosignerData] = useLocalStorageState<
    AddPermissionResponse | undefined
  >(WC_COSIGNER_DATA, undefined)

  function clearGrantedPermissions() {
    removeLocalStorageItem(GRANTED_PERMISSIONS_KEY)
    setGrantedPermissions(undefined)
  }

  return (
    <ERC7715PermissionsContext.Provider
      value={{
        projectId,
        grantedPermissions,
        wcCosignerData,
        clearGrantedPermissions,
        setGrantedPermissions,
        setWCCosignerData
      }}
    >
      {children}
    </ERC7715PermissionsContext.Provider>
  )
}

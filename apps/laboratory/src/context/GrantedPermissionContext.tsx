import type { ReactNode } from 'react'
import { createContext } from 'react'
import {
  GRANTED_PERMISSIONS_KEY,
  PASSKEY_LOCALSTORAGE_KEY,
  WC_COSIGNER_DATA,
  type PasskeyLocalStorageFormat
} from '../utils/LocalStorage'
import { useLocalStorageState } from '../hooks/useLocalStorageState'
import type { GrantPermissionsReturnType } from 'viem/experimental'
import type { AddPermissionResponse } from '../hooks/useWalletConnectCosigner'
import type { P256Credential } from 'webauthn-p256'

type PasskeyStorageType = P256Credential | PasskeyLocalStorageFormat | undefined
interface GrantedPermissionsContextType {
  passkey: PasskeyStorageType
  grantedPermissions: GrantPermissionsReturnType | undefined
  wcCosignerData: AddPermissionResponse | undefined
  setGrantedPermissions: React.Dispatch<
    React.SetStateAction<GrantPermissionsReturnType | undefined>
  >
  setWCCosignerData: React.Dispatch<React.SetStateAction<AddPermissionResponse | undefined>>
  setPasskey: React.Dispatch<React.SetStateAction<PasskeyStorageType | undefined>>
}
function noop() {
  console.warn('GrantedPermissionsContext used outside of provider')
}
export const GrantedPermissionsContext = createContext<GrantedPermissionsContextType>({
  passkey: undefined,
  grantedPermissions: undefined,
  wcCosignerData: undefined,
  setGrantedPermissions: noop,
  setWCCosignerData: noop,
  setPasskey: noop
})

interface GrantedPermissionsProviderProps {
  children: ReactNode
}

export function GrantedPermissionsProvider({ children }: GrantedPermissionsProviderProps) {
  const [passkey, setPasskey] = useLocalStorageState<PasskeyStorageType>(
    PASSKEY_LOCALSTORAGE_KEY,
    undefined
  )
  const [grantedPermissions, setGrantedPermissions] = useLocalStorageState<
    GrantPermissionsReturnType | undefined
  >(GRANTED_PERMISSIONS_KEY, undefined)
  const [wcCosignerData, setWCCosignerData] = useLocalStorageState<
    AddPermissionResponse | undefined
  >(WC_COSIGNER_DATA, undefined)

  return (
    <GrantedPermissionsContext.Provider
      value={{
        passkey,
        grantedPermissions,
        wcCosignerData,
        setPasskey,
        setGrantedPermissions,
        setWCCosignerData
      }}
    >
      {children}
    </GrantedPermissionsContext.Provider>
  )
}

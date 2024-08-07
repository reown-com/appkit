import type { ReactNode } from 'react'
import { createContext, useContext, useEffect, useState } from 'react'
import {
  GRANTED_PERMISSIONS_KEY,
  PASSKEY_LOCALSTORAGE_KEY,
  removeItem,
  setItem,
  WC_COSIGNER_DATA,
  type PasskeyLocalStorageFormat
} from '../utils/LocalStorage'
import { useLocalStorageState } from '../hooks/useLocalStorageState'
import type { GrantPermissionsReturnType } from 'viem/experimental'
import type { AddPermissionResponse } from '../hooks/useWalletConnectCosigner'
import type { P256Credential } from 'webauthn-p256'

type PasskeyStorageType = P256Credential | PasskeyLocalStorageFormat | undefined
interface WagmiPermissionsSyncContextType {
  passkey: PasskeyStorageType
  isPasskeyAvailable: boolean
  passkeyId: string
  grantedPermissions: GrantPermissionsReturnType | undefined
  wcCosignerData: AddPermissionResponse | undefined
  setGrantedPermissions: React.Dispatch<
    React.SetStateAction<GrantPermissionsReturnType | undefined>
  >
  setWCCosignerData: React.Dispatch<React.SetStateAction<AddPermissionResponse | undefined>>
  setPasskey: (value: PasskeyStorageType) => void
  clearGrantedPermissions: () => void
}
function noop() {
  console.warn('WagmiPermissionsSyncContext used outside of provider')
}
export const WagmiPermissionsSyncContext = createContext<WagmiPermissionsSyncContextType>({
  passkey: undefined,
  isPasskeyAvailable: false,
  passkeyId: '',
  grantedPermissions: undefined,
  wcCosignerData: undefined,
  setGrantedPermissions: noop,
  setWCCosignerData: noop,
  setPasskey: noop,
  clearGrantedPermissions: noop
})

interface WagmiPermissionsSyncProviderProps {
  children: ReactNode
}

export function WagmiPermissionsSyncProvider({ children }: WagmiPermissionsSyncProviderProps) {
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

  const [isPasskeyAvailable, setIsPasskeyAvailable] = useState(false)
  const [passkeyId, setPasskeyId] = useState('')
  function setNewPasskey(value: PasskeyStorageType) {
    setItem(PASSKEY_LOCALSTORAGE_KEY, '')
    setPasskey(value)
    setIsPasskeyAvailable(false)
  }
  function clearGrantedPermissions() {
    removeItem(GRANTED_PERMISSIONS_KEY)
    setGrantedPermissions(undefined)
  }

  useEffect(() => {
    if (passkey) {
      setIsPasskeyAvailable(true)
      setPasskeyId((passkey as P256Credential).id)
    }
  }, [passkey])

  return (
    <WagmiPermissionsSyncContext.Provider
      value={{
        passkey,
        isPasskeyAvailable,
        passkeyId,
        grantedPermissions,
        wcCosignerData,
        clearGrantedPermissions,
        setPasskey: setNewPasskey,
        setGrantedPermissions,
        setWCCosignerData
      }}
    >
      {children}
    </WagmiPermissionsSyncContext.Provider>
  )
}
export function useWagmiPermissionsSync() {
  const context = useContext(WagmiPermissionsSyncContext)
  if (!context) {
    throw new Error('useWagmiPermissions must be used within a WagmiPermissionsSyncContext')
  }

  return context
}

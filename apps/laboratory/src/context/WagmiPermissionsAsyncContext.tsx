import type { ReactNode } from 'react'
import { createContext, useContext, useEffect, useState } from 'react'
import {
  GRANTED_PERMISSIONS_KEY,
  LOCAL_SIGNER_KEY,
  removeItem,
  WC_COSIGNER_DATA
} from '../utils/LocalStorage'
import { useLocalStorageState } from '../hooks/useLocalStorageState'
import type { GrantPermissionsReturnType } from 'viem/experimental'
import type { AddPermissionResponse } from '../hooks/useWalletConnectCosigner'
import { generatePrivateKey, privateKeyToAccount, type PrivateKeyAccount } from 'viem/accounts'
import { useChakraToast } from '../components/Toast'

interface WagmiPermissionsAsyncContextType {
  privateKey: string | undefined
  signer: PrivateKeyAccount | undefined
  grantedPermissions: GrantPermissionsReturnType | undefined
  setGrantedPermissions: React.Dispatch<
    React.SetStateAction<GrantPermissionsReturnType | undefined>
  >
  wcCosignerData: AddPermissionResponse | undefined
  setWCCosignerData: React.Dispatch<React.SetStateAction<AddPermissionResponse | undefined>>
  clearGrantedPermissions: () => void
}
function noop() {
  console.warn('WagmiPermissionsAsyncContext used outside of provider')
}
export const WagmiPermissionsAsyncContext = createContext<WagmiPermissionsAsyncContextType>({
  privateKey: undefined,
  signer: undefined,
  grantedPermissions: undefined,
  wcCosignerData: undefined,
  setGrantedPermissions: noop,
  setWCCosignerData: noop,
  clearGrantedPermissions: noop
})

interface WagmiPermissionsAsyncProviderProps {
  children: ReactNode
}

export function WagmiPermissionsAsyncProvider({ children }: WagmiPermissionsAsyncProviderProps) {
  const toast = useChakraToast()
  const [privateKey, setPrivateKey] = useLocalStorageState<string | undefined>(
    LOCAL_SIGNER_KEY,
    undefined
  )
  const [grantedPermissions, setGrantedPermissions] = useLocalStorageState<
    GrantPermissionsReturnType | undefined
  >(GRANTED_PERMISSIONS_KEY, undefined)
  const [wcCosignerData, setWCCosignerData] = useLocalStorageState<
    AddPermissionResponse | undefined
  >(WC_COSIGNER_DATA, undefined)

  const [signer, setSigner] = useState<PrivateKeyAccount | undefined>()

  function clearGrantedPermissions() {
    removeItem(GRANTED_PERMISSIONS_KEY)
    setGrantedPermissions(undefined)
  }

  useEffect(() => {
    try {
      let storedPrivateKey = localStorage.getItem(LOCAL_SIGNER_KEY)
      if (!storedPrivateKey) {
        const newPrivateKey = generatePrivateKey()
        setPrivateKey(newPrivateKey)
        storedPrivateKey = newPrivateKey
      }
      const accountSigner = privateKeyToAccount(storedPrivateKey as `0x${string}`)
      setSigner(accountSigner)
    } catch {
      toast({
        title: 'Failure',
        description: 'No private key available',
        type: 'error'
      })
    }
  }, [])

  return (
    <WagmiPermissionsAsyncContext.Provider
      value={{
        privateKey,
        signer,
        grantedPermissions,
        wcCosignerData,
        clearGrantedPermissions,
        setGrantedPermissions,
        setWCCosignerData
      }}
    >
      {children}
    </WagmiPermissionsAsyncContext.Provider>
  )
}
export function useWagmiPermissionsAsync() {
  const context = useContext(WagmiPermissionsAsyncContext)
  if (context === undefined) {
    throw new Error('useWagmiPermissionsAsync must be used within a GrantedPermissionsProvider')
  }

  return context
}

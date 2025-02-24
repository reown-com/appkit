import type { ReactNode } from 'react'
import { createContext, useContext, useEffect, useState } from 'react'

import type { P256Credential } from 'webauthn-p256'

import { useLocalStorageState } from '@/src/hooks/useLocalStorageState'
import {
  PASSKEY_LOCALSTORAGE_KEY,
  type PasskeyLocalStorageFormat,
  setLocalStorageItem
} from '@/src/utils/LocalStorage'

export type PasskeyStorageType = P256Credential | PasskeyLocalStorageFormat | undefined
type PasskeyContextType = {
  passkey: PasskeyStorageType
  isPasskeyAvailable: boolean
  passkeyId: string
  setPasskey: (value: PasskeyStorageType) => void
}

function noop() {
  console.warn('PasskeyContext used outside of provider')
}
export const PasskeyContext = createContext<PasskeyContextType>({
  passkey: undefined,
  isPasskeyAvailable: false,
  passkeyId: '',
  setPasskey: noop
})

interface PasskeyProviderProps {
  children: ReactNode
}

export function PasskeyProvider({ children }: PasskeyProviderProps) {
  const [passkey, setPasskey] = useLocalStorageState<PasskeyStorageType>(
    PASSKEY_LOCALSTORAGE_KEY,
    undefined
  )
  const [isPasskeyAvailable, setIsPasskeyAvailable] = useState(false)
  const [passkeyId, setPasskeyId] = useState('')
  function setNewPasskey(value: PasskeyStorageType) {
    setLocalStorageItem(PASSKEY_LOCALSTORAGE_KEY, '')
    setPasskey(value)
    setIsPasskeyAvailable(false)
  }

  useEffect(() => {
    if (passkey) {
      setIsPasskeyAvailable(true)
      setPasskeyId((passkey as P256Credential).id)
    }
  }, [passkey])

  return (
    <PasskeyContext.Provider
      value={{
        passkey,
        isPasskeyAvailable,
        passkeyId,
        setPasskey: setNewPasskey
      }}
    >
      {children}
    </PasskeyContext.Provider>
  )
}
export function usePasskey() {
  const context = useContext(PasskeyContext)
  if (!context) {
    throw new Error('usePasskey must be used within a PasskeyContext')
  }

  return context
}

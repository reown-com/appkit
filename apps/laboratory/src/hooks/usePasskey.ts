import { useEffect, useState } from 'react'
import { useLocalStorageState } from './useLocalStorageState'
import { type P256Credential } from 'webauthn-p256'
import {
  setItem,
  PASSKEY_LOCALSTORAGE_KEY,
  type PasskeyLocalStorageFormat
} from '../utils/LocalStorage'

type PasskeyStorageType = P256Credential | PasskeyLocalStorageFormat | undefined

function usePasskey() {
  const [passKey, setPasskey] = useLocalStorageState<PasskeyStorageType>(
    PASSKEY_LOCALSTORAGE_KEY,
    undefined
  )
  const [isPasskeyAvailable, setIsPasskeyAvailable] = useState(false)
  const [passkeyId, setPasskeyId] = useState('')
  function setNewPasskey(value: PasskeyStorageType) {
    setItem(PASSKEY_LOCALSTORAGE_KEY, '')
    setPasskey(value)
    setIsPasskeyAvailable(false)
  }

  useEffect(() => {
    if (passKey) {
      setIsPasskeyAvailable(true)
      setPasskeyId((passKey as P256Credential).id)
    }
  }, [passKey])

  return {
    isPasskeyAvailable,
    passKey,
    setPasskey: setNewPasskey,
    passkeyId
  }
}

export default usePasskey

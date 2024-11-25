import type { ReactNode } from 'react'
import { createContext, useContext, useEffect, useState } from 'react'
import { getLocalStorageItem, LOCAL_SIGNER_KEY } from '../utils/LocalStorage'
import { generatePrivateKey, privateKeyToAccount, type PrivateKeyAccount } from 'viem/accounts'
import { useChakraToast } from '../components/Toast'
import { useLocalStorageState } from '../hooks/useLocalStorageState'

type LocalEcdsaKeyContextType = {
  privateKey: string | undefined
  signer: PrivateKeyAccount | undefined
}

export const LocalEcdsaKeyContext = createContext<LocalEcdsaKeyContextType>({
  privateKey: undefined,
  signer: undefined
})

interface LocalEcdsaKeyProviderProps {
  children: ReactNode
}

export function LocalEcdsaKeyProvider({ children }: LocalEcdsaKeyProviderProps) {
  const toast = useChakraToast()
  const projectId = process.env['NEXT_PUBLIC_PROJECT_ID']
  if (!projectId) {
    throw new Error('NEXT_PUBLIC_PROJECT_ID is not set')
  }
  const [privateKey, setPrivateKey] = useLocalStorageState<string | undefined>(
    LOCAL_SIGNER_KEY,
    undefined
  )

  const [signer, setSigner] = useState<PrivateKeyAccount | undefined>()

  useEffect(() => {
    try {
      let storedPrivateKey = getLocalStorageItem(LOCAL_SIGNER_KEY)
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
    <LocalEcdsaKeyContext.Provider
      value={{
        privateKey,
        signer
      }}
    >
      {children}
    </LocalEcdsaKeyContext.Provider>
  )
}
export function useLocalEcdsaKey() {
  const context = useContext(LocalEcdsaKeyContext)
  if (context === undefined) {
    throw new Error('useLocalEcdsaKey must be used within a LocalEcdsaKeyProvider')
  }

  return context
}

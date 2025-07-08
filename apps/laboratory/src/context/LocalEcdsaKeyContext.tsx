import type { ReactNode } from 'react'
import { createContext, useContext, useEffect, useState } from 'react'

import { type PrivateKeyAccount, generatePrivateKey, privateKeyToAccount } from 'viem/accounts'

import type { Address } from '@reown/appkit-common'

import { useChakraToast } from '@/src/components/Toast'
import { useLocalStorageState } from '@/src/hooks/useLocalStorageState'
import { LOCAL_SIGNER_KEY, getLocalStorageItem } from '@/src/utils/LocalStorage'

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
      const accountSigner = privateKeyToAccount(storedPrivateKey as Address)
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

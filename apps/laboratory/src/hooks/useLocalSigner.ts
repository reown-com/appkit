import { useEffect, useState } from 'react'
import { type PrivateKeyAccount, generatePrivateKey, privateKeyToAccount } from 'viem/accounts'
import { getItem, setItem, LOCAL_SIGNER_KEY } from '../utils/LocalStorage'

export function useLocalSigner() {
  const [signerPrivateKey, setSignerPrivateKey] = useState<string | undefined>(undefined)
  const [signer, setSigner] = useState<PrivateKeyAccount | undefined>(undefined)

  useEffect(() => {
    let key = getItem(LOCAL_SIGNER_KEY)
    if (!key) {
      key = generatePrivateKey()
      setItem(LOCAL_SIGNER_KEY, key)
    }
    setSignerPrivateKey(key)
    setSigner(privateKeyToAccount(key as `0x${string}`))
  }, [signerPrivateKey])

  return {
    signerPrivateKey,
    signer
  }
}

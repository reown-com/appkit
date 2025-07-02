import { useEffect } from 'react'

import { Button, Stack } from '@chakra-ui/react'
import { privateKeyToAccount } from 'viem/accounts'
import { createCredential } from 'webauthn-p256'

import type { Address } from '@reown/appkit-common'

import { useChakraToast } from '@/src/components/Toast'
import { usePasskey } from '@/src/context/PasskeyContext'
import { LOCAL_SIGNER_KEY, getLocalStorageItem } from '@/src/utils/LocalStorage'

export function WagmiCreatePasskeySignerTest() {
  const { isPasskeyAvailable, setPasskey, passkeyId } = usePasskey()
  const toast = useChakraToast()

  async function handleCreatePasskey() {
    try {
      const credential = await createCredential({
        name: 'Session key'
      })
      setPasskey(credential)
      toast({
        type: 'success',
        title: 'Passkey created succesfully',
        description: ''
      })
    } catch (error) {
      toast({
        type: 'error',
        title: `Unable to create passkey`,
        description: `Reason ${error}`
      })
    }
  }

  useEffect(() => {
    const storedLocalSignerPrivateKey = getLocalStorageItem(LOCAL_SIGNER_KEY)
    if (storedLocalSignerPrivateKey) {
      privateKeyToAccount(storedLocalSignerPrivateKey as Address)
    }
  }, [])

  return (
    <Stack direction={['column', 'column', 'row']} align={'center'}>
      <Button data-testid="sign-message-button" onClick={handleCreatePasskey}>
        Create New Passkey
      </Button>
      {isPasskeyAvailable && passkeyId && <div>Passkey Id: {passkeyId}</div>}
    </Stack>
  )
}

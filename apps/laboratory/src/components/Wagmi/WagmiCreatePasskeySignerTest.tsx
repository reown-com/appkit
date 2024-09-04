import { useEffect } from 'react'
import { Button, Stack } from '@chakra-ui/react'
import { privateKeyToAccount } from 'viem/accounts'
import { useChakraToast } from '../Toast'
import { LOCAL_SIGNER_KEY, getLocalStorageItem } from '../../utils/LocalStorage'
import { createCredential } from 'webauthn-p256'
import { usePasskey } from '../../context/PasskeyContext'

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
      privateKeyToAccount(storedLocalSignerPrivateKey as `0x${string}`)
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

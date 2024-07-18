import { useState, useEffect } from 'react'
import { Button, Stack } from '@chakra-ui/react'
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts'
import { useChakraToast } from '../Toast'
import { LOCAL_SIGNER_KEY, setItem, getItem } from '../../utils/LocalStorage'

export function WagmiCreatePrivateKeySignerTest() {
  const toast = useChakraToast()
  const [signerAddress, setSignerAddress] = useState<string | undefined>()

  function onCreateNewPrivateKey() {
    try {
      const privateKey = generatePrivateKey()
      setItem(LOCAL_SIGNER_KEY, privateKey)
      const account = privateKeyToAccount(privateKey)
      setSignerAddress(account.address)
      toast({
        title: 'Created new local signer',
        description: account.address,
        type: 'success'
      })
    } catch {
      toast({
        title: 'Failure',
        description: 'Failed to create new signer',
        type: 'error'
      })
    }
  }

  useEffect(() => {
    const storedLocalSignerPrivateKey = getItem(LOCAL_SIGNER_KEY)
    if (storedLocalSignerPrivateKey) {
      const account = privateKeyToAccount(storedLocalSignerPrivateKey as `0x${string}`)
      setSignerAddress(account.address)
    }
  }, [])

  return (
    <Stack direction={['column', 'column', 'row']} align={'center'}>
      <Button data-testid="sign-message-button" onClick={onCreateNewPrivateKey}>
        Create New Signer
      </Button>
      {signerAddress && <div>{signerAddress}</div>}
    </Stack>
  )
}

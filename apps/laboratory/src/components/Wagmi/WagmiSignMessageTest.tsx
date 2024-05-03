import * as React from 'react'
import { Button } from '@chakra-ui/react'
import { useSignMessage, useAccount } from 'wagmi'
import { ConstantsUtil } from '../../utils/ConstantsUtil'
import { useChakraToast } from '../Toast'

export function WagmiSignMessageTest() {
  const toast = useChakraToast()

  const { signMessageAsync } = useSignMessage()
  const { status } = useAccount()
  const isConnected = status === 'connected'

  async function onSignMessage() {
    try {
      const signature = await signMessageAsync({ message: 'Hello Web3Modal!' })
      toast({
        title: ConstantsUtil.SigningSucceededToastTitle,
        description: signature,
        type: 'success'
      })
    } catch {
      toast({
        title: ConstantsUtil.SigningFailedToastTitle,
        description: 'Failed to sign message',
        type: 'error'
      })
    }
  }

  return (
    <Button data-testid="sign-message-button" onClick={onSignMessage} isDisabled={!isConnected}>
      Sign Message
    </Button>
  )
}

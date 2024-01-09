import { Button, useToast } from '@chakra-ui/react'
import { useSignMessage } from 'wagmi'
import { ConstantsUtil } from '../../utils/ConstantsUtil'

export function WagmiSignMessageTest() {
  const toast = useToast()
  const { signMessageAsync } = useSignMessage({ message: 'Hello Web3Modal!' })

  async function onSignMessage() {
    try {
      const signature = await signMessageAsync()
      toast({
        title: ConstantsUtil.SigningSucceededToastTitle,
        description: signature,
        status: 'success',
        isClosable: true
      })
    } catch {
      toast({
        title: ConstantsUtil.SigningFailedToastTitle,
        description: 'Failed to sign message',
        status: 'error',
        isClosable: true
      })
    }
  }

  return (
    <Button data-testid="sign-message-button" onClick={onSignMessage}>
      Sign Message
    </Button>
  )
}

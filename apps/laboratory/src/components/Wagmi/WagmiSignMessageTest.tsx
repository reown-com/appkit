import { Button, useToast } from '@chakra-ui/react'
import { useSignMessage, useAccount } from 'wagmi'
import { ConstantsUtil } from '../../utils/ConstantsUtil'

export function WagmiSignMessageTest() {
  const toast = useToast()
  const { signMessageAsync } = useSignMessage()
  const { status } = useAccount()
  const isConnected = status === 'connected'

  async function onSignMessage() {
    try {
      const signature = await signMessageAsync({ message: 'Hello Web3Modal!' })
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
    <Button data-testid="sign-message-button" onClick={onSignMessage} isDisabled={!isConnected}>
      Sign Message
    </Button>
  )
}

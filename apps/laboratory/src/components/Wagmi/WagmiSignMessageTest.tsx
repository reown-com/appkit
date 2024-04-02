import { useSignMessage, useAccount } from 'wagmi'
import { ConstantsUtil } from '../../utils/ConstantsUtil'
import { Button } from '@/components/ui/button'
import { useToast } from '@chakra-ui/react'

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
    <Button
      data-testid="sign-message-button"
      onClick={onSignMessage}
      disabled={!isConnected}
      variant={'secondary'}
    >
      Sign Message
    </Button>
  )
}

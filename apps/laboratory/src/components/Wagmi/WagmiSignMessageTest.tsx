import { useSignMessage, useAccount } from 'wagmi'
import { ConstantsUtil } from '../../utils/ConstantsUtil'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

export function WagmiSignMessageTest() {
  const { signMessageAsync } = useSignMessage()
  const { status } = useAccount()
  const isConnected = status === 'connected'

  async function onSignMessage() {
    try {
      const signature = await signMessageAsync({ message: 'Hello Web3Modal!' })
      toast.success(ConstantsUtil.SigningSucceededToastTitle, {
        description: signature
      })
    } catch {
      toast.error(ConstantsUtil.SigningFailedToastTitle, {
        description: 'Failed to sign message'
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

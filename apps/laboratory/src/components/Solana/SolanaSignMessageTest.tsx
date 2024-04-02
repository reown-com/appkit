import { toast } from 'sonner'

import { useWeb3ModalAccount, useWeb3ModalProvider } from '@web3modal/solana/react'

import { ConstantsUtil } from '../../utils/ConstantsUtil'
import { Button } from '@/components/ui/button'

export function SolanaSignMessageTest() {
  const { address } = useWeb3ModalAccount()
  const { walletProvider } = useWeb3ModalProvider()

  async function onSignMessage() {
    try {
      if (!walletProvider || !address) {
        throw Error('user is disconnected')
      }

      const encodedMessage = new TextEncoder().encode('Hello from Web3Modal')
      const signature = await walletProvider.signMessage(encodedMessage)

      // Backpack has specific signature format now
      if ((signature as { signature: Uint8Array }).signature) {
        toast.success(ConstantsUtil.SigningSucceededToastTitle, {
          description: (signature as { signature: Uint8Array }).signature
        })

        return
      }
      toast.success(ConstantsUtil.SigningSucceededToastTitle, {
        description: signature as Uint8Array
      })
    } catch (err) {
      toast.error(ConstantsUtil.SigningFailedToastTitle, {
        description: 'Failed to sign message'
      })
    }
  }

  return (
    <Button data-testid="sign-message-button" onClick={onSignMessage} variant={'secondary'}>
      Sign Message
    </Button>
  )
}

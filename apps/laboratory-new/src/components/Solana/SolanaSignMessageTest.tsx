import { Button } from '@chakra-ui/react'

import { useAppKitProvider } from '@reown/appkit-new/react'

import { ConstantsUtil } from '../../utils/ConstantsUtil'
import { useChakraToast } from '../Toast'
import type { Provider } from '@reown/appkit-adapter-solana'

export function SolanaSignMessageTest() {
  const toast = useChakraToast()
  const { walletProvider } = useAppKitProvider<Provider>('solana')

  async function onSignMessage() {
    try {
      if (!walletProvider) {
        throw Error('user is disconnected')
      }

      const encodedMessage = new TextEncoder().encode('Hello from AppKit')
      const signature = await walletProvider.signMessage(encodedMessage)

      toast({
        title: ConstantsUtil.SigningSucceededToastTitle,
        description: signature,
        type: 'success'
      })
    } catch (err) {
      toast({
        title: ConstantsUtil.SigningFailedToastTitle,
        description: (err as Error).message,
        type: 'error'
      })
    }
  }

  return (
    <Button data-testid="sign-message-button" onClick={onSignMessage}>
      Sign Message
    </Button>
  )
}

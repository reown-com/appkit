import { Button } from '@chakra-ui/react'

import { useWeb3ModalProvider } from '@web3modal/base/react'

import { ConstantsUtil } from '../../utils/ConstantsUtil'
import { useChakraToast } from '../Toast'
import type { Provider } from '@web3modal/adapter-solana'

export function SolanaSignMessageTest() {
  const toast = useChakraToast()
  const { walletProvider } = useWeb3ModalProvider<Provider>('solana')

  async function onSignMessage() {
    try {
      if (!walletProvider) {
        throw Error('user is disconnected')
      }

      const encodedMessage = new TextEncoder().encode('Hello from Web3Modal')
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

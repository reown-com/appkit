import { Button } from '@chakra-ui/react'

import { useWeb3ModalAccount, useWeb3ModalProvider } from '@web3modal/solana/react'

import { ConstantsUtil } from '../../utils/ConstantsUtil'
import { useChakraToast } from '../Toast'

export function SolanaSignMessageTest() {
  const toast = useChakraToast()
  const { address } = useWeb3ModalAccount()
  const { walletProvider } = useWeb3ModalProvider()

  async function onSignMessage() {
    try {
      if (!walletProvider || !address) {
        throw Error('user is disconnected')
      }

      const encodedMessage = new TextEncoder().encode('Hello from Web3Modal')
      const signature = await walletProvider.signMessage(encodedMessage)

      toast({
        title: ConstantsUtil.SigningSucceededToastTitle,
        description: signature as Uint8Array,
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

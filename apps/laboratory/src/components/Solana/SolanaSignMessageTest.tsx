import { Button, useToast } from '@chakra-ui/react'

import { useWeb3ModalAccount, useWeb3ModalProvider } from '@web3modal/solana/react'

import { ConstantsUtil } from '../../utils/ConstantsUtil'

export function SolanaSignMessageTest() {
  const toast = useToast()
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
      if (signature.signature) {
        toast({
          title: ConstantsUtil.SigningSucceededToastTitle,
          description: signature.signature,
          status: 'success',
          isClosable: true
        })

        return
      }
      toast({
        title: ConstantsUtil.SigningSucceededToastTitle,
        description: signature,
        status: 'success',
        isClosable: true
      })
    } catch (err) {
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

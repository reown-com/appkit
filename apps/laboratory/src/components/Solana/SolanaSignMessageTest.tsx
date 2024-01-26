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
      const generateMessage = (message: string) => {
        if (walletProvider.id === "WalletConnect") {
          return message
        } else {
          return new TextEncoder().encode(message)
        }
      }
      const signature = await walletProvider.signMessage(generateMessage('Hello Web3Modal Solana'))
      toast({
        title: ConstantsUtil.SigningSucceededToastTitle,
        description: signature,
        status: 'success',
        isClosable: true
      })
    } catch (err) {
      console.log(`err`, err);
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

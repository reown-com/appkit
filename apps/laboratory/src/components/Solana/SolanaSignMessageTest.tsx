import { Button } from '@chakra-ui/react'

import { useWeb3ModalProvider } from '@web3modal/base/react'

import { ConstantsUtil } from '../../utils/ConstantsUtil'
import { useChakraToast } from '../Toast'
import type { Provider } from '@web3modal/base/adapters/solana/web3js'

export function SolanaSignMessageTest() {
  const toast = useChakraToast()
  const { walletProviders } = useWeb3ModalProvider<Provider>()

  async function onSignMessage() {
    try {
      if (!walletProviders['solana']) {
        throw Error('user is disconnected')
      }

      const encodedMessage = new TextEncoder().encode('Hello from Web3Modal')
      const signature = await walletProviders['solana'].signMessage(encodedMessage)

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

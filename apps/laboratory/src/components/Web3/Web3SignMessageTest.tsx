import { Button } from '@chakra-ui/react'
import { useWeb3ModalAccount, useWeb3ModalProvider } from '@web3modal/web3/react'
import {
  // @TODO consider using this code instead of the next line: utils, eth, Web3Context, ETH_DATA_FORMAT,
  Web3
} from 'web3'
import { ConstantsUtil } from '../../utils/ConstantsUtil'
import { useChakraToast } from '../Toast'

export function Web3SignMessageTest() {
  const toast = useChakraToast()
  const { address, chainId } = useWeb3ModalAccount()
  const { walletProvider } = useWeb3ModalProvider()

  async function onSignMessage() {
    try {
      if (!walletProvider || !address) {
        throw Error('user is disconnected')
      }

      /*
       * @TODO consider using this code instead of the next line:
       *   const signatureObject = await eth.sign(
       *     new Web3Context({ provider: walletProvider, config: { defaultNetworkId: chainId } }),
       *    utils.utf8ToHex('Hello Web3Modal Web3 Signer!'),
       *    address,
       *     ETH_DATA_FORMAT
       *   )
       */

      const web3 = new Web3({ provider: walletProvider, config: { defaultNetworkId: chainId } })

      // Sign only takes hexstrings, so turn message to hexstring
      const message = web3.utils.utf8ToHex('Hello Web3Modal Web3 Signer!')
      const signature = await web3.eth.personal.sign(message, address, '')

      toast({
        title: ConstantsUtil.SigningSucceededToastTitle,
        description: signature,
        type: 'success'
      })
    } catch {
      toast({
        title: ConstantsUtil.SigningFailedToastTitle,
        description: 'Failed to sign message',
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

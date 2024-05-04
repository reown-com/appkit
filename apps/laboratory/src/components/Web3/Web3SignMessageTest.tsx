import { Button } from '@chakra-ui/react'
import { useWeb3ModalAccount, useWeb3ModalProvider } from '@web3modal/web3/react'

import { Personal } from 'web3-eth-personal'
import { utf8ToHex } from 'web3-utils'

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

      const personal = new Personal({
        provider: walletProvider,
        config: { defaultNetworkId: chainId }
      })
      /**
       * Alternative to the above you can use the following:
       * ```
       * import { Web3 } from 'web3'
       * ...
       * const web3 = new Web3({ provider: walletProvider, config: { defaultNetworkId: chainId } })
       * ```
       * And later in the code: you can use `web3.eth.personal` instead of `personal`, and `web3.utils.utf8ToHex(...)` instead of `utf8ToHex(...)`.
       */

      // Sign only takes hexstrings, so turn message to hexstring
      const message = utf8ToHex('Hello Web3Modal Web3 Signer!')
      const signature = await personal.sign(message, address, '')

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

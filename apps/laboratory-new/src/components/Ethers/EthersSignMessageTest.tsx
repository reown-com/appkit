import { Button } from '@chakra-ui/react'
import { useState } from 'react'
import { useAppKitAccount, useAppKitProvider, type Provider } from '@reown/appkit-new/react'
import { BrowserProvider, JsonRpcSigner } from 'ethers'
import { ConstantsUtil } from '../../utils/ConstantsUtil'
import { useChakraToast } from '../Toast'

export function EthersSignMessageTest() {
  const toast = useChakraToast()
  const { address } = useAppKitAccount()
  const { walletProvider } = useAppKitProvider<Provider>('eip155')
  const [signature, setSignature] = useState<string | undefined>()

  async function onSignMessage() {
    try {
      if (!walletProvider || !address) {
        throw Error('user is disconnected')
      }

      const provider = new BrowserProvider(walletProvider, 1)
      const signer = new JsonRpcSigner(provider, address)
      const sig = await signer?.signMessage('Hello AppKit!')
      setSignature(sig)
      toast({
        title: ConstantsUtil.SigningSucceededToastTitle,
        description: signature,
        type: 'success'
      })
    } catch (error) {
      toast({
        title: ConstantsUtil.SigningFailedToastTitle,
        description: 'Failed to sign message',
        type: 'error'
      })
    }
  }

  return (
    <>
      <Button data-testid="sign-message-button" onClick={onSignMessage} width="auto">
        Sign Message
      </Button>
      <div data-testid="w3m-signature" hidden>
        {signature}
      </div>
    </>
  )
}

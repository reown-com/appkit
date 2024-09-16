import { Button } from '@chakra-ui/react'
import { useState } from 'react'
import {
  useAppKitAccount,
  useAppKitNetwork,
  useAppKitProvider,
  type Provider
} from '@reown/appkit/react'
import { ethers } from 'ethers5'
import { ConstantsUtil } from '../../utils/ConstantsUtil'
import { useChakraToast } from '../Toast'

export function Ethers5SignMessageTest() {
  const [signature, setSignature] = useState<string | undefined>()
  const toast = useChakraToast()

  const { chainId } = useAppKitNetwork()
  const { address } = useAppKitAccount()
  const { walletProvider } = useAppKitProvider<Provider>('eip155')

  async function onSignMessage() {
    try {
      if (!walletProvider || !address) {
        throw Error('user is disconnected')
      }
      const provider = new ethers.providers.Web3Provider(walletProvider, chainId)
      const signer = provider.getSigner(address)
      const sig = await signer?.signMessage('Hello AppKit!')
      setSignature(sig)
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

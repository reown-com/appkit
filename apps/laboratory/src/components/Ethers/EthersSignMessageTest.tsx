import { Button } from '@chakra-ui/react'
import { useState } from 'react'
import {
  useAppKitAccount,
  useAppKitNetwork,
  useAppKitProvider,
  type Provider
} from '@reown/appkit/react'
import { BrowserProvider, JsonRpcSigner } from 'ethers'
import { ConstantsUtil } from '../../utils/ConstantsUtil'
import { useChakraToast } from '../Toast'
import { createPublicClient, http } from 'viem'
import * as chains from 'viem/chains'

export function EthersSignMessageTest() {
  const toast = useChakraToast()
  const { address } = useAppKitAccount()
  const { caipNetwork, chainId } = useAppKitNetwork()
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

      // Need to use viem even in Ethers as it's the easy way to verify SA signatures
      const publicClient = createPublicClient({
        transport: http(caipNetwork?.rpcUrls?.default?.http[0]),
        chain: Object.values(chains).find(c => c.id === chainId)
      })

      const valid = await publicClient.verifyMessage({
        message: 'Hello AppKit!',
        signature: sig as `0x${string}`,
        address: address as `0x${string}`
      })

      if (valid) {
        toast({
          title: 'Signature Verification',
          description: 'Signature is valid',
          type: 'success'
        })
      } else {
        toast({
          title: 'Signature Verification',
          description: 'Signature is invalid',
          type: 'error'
        })
      }
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

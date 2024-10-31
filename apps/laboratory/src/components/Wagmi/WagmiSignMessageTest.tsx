import * as React from 'react'
import { Button } from '@chakra-ui/react'
import { useSignMessage } from 'wagmi'
import { ConstantsUtil } from '../../utils/ConstantsUtil'
import { useChakraToast } from '../Toast'
import { useAppKitAccount, useAppKitNetwork } from '@reown/appkit/react'
import { createPublicClient, http, type Address } from 'viem'
import * as chains from 'viem/chains'

export function WagmiSignMessageTest() {
  const toast = useChakraToast()
  const { address } = useAppKitAccount()
  const { chainId, caipNetwork } = useAppKitNetwork()

  const { signMessageAsync, isPending } = useSignMessage()
  const { isConnected } = useAppKitAccount()

  const [signature, setSignature] = React.useState<string | undefined>()

  async function onSignMessage() {
    if (!address) {
      toast({
        title: ConstantsUtil.SigningFailedToastTitle,
        description: 'No address found',
        type: 'error'
      })

      return
    }

    try {
      const sig = await signMessageAsync({ message: 'Hello AppKit!', account: address as Address })
      setSignature(sig)
      toast({
        title: ConstantsUtil.SigningSucceededToastTitle,
        description: sig,
        type: 'success'
      })

      const publicClient = createPublicClient({
        transport: http(caipNetwork?.rpcUrls?.default?.http[0]),
        chain: Object.values(chains).find(c => c.id === chainId)
      })

      const valid = await publicClient.verifyMessage({
        message: 'Hello AppKit!',
        signature: sig,
        address: address as Address
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
    } catch (e) {
      toast({
        title: ConstantsUtil.SigningFailedToastTitle,
        description: 'Failed to sign message',
        type: 'error'
      })
    }
  }

  return (
    <>
      <Button
        data-testid="sign-message-button"
        onClick={onSignMessage}
        isDisabled={!isConnected || isPending}
        isLoading={isPending}
      >
        Sign Message
      </Button>
      <div data-testid="w3m-signature" hidden>
        {signature}
      </div>
    </>
  )
}

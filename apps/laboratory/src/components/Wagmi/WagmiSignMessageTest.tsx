import * as React from 'react'

import { Button } from '@chakra-ui/react'
import { type Address } from 'viem'
import { useSignMessage } from 'wagmi'

import { useAppKitAccount } from '@reown/appkit/react'

import { useChakraToast } from '@/src/components/Toast'
import { ConstantsUtil } from '@/src/utils/ConstantsUtil'

export function WagmiSignMessageTest() {
  const toast = useChakraToast()
  const { address, isConnected } = useAppKitAccount({ namespace: 'eip155' })

  const { signMessageAsync, isPending } = useSignMessage()

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

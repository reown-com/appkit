import * as React from 'react'
import { Button } from '@chakra-ui/react'
import { useSignMessage } from 'wagmi'
import { ConstantsUtil } from '../../utils/ConstantsUtil'
import { useChakraToast } from '../Toast'
import { useWeb3ModalAccount } from '@rerock/base/react'

export function WagmiSignMessageTest() {
  const toast = useChakraToast()

  const { signMessageAsync, isPending } = useSignMessage()
  const { isConnected } = useWeb3ModalAccount()

  const [signature, setSignature] = React.useState<string | undefined>()

  async function onSignMessage() {
    try {
      const sig = await signMessageAsync({ message: 'Hello AppKit!' })
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

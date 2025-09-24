import * as React from 'react'

import { Box, Button } from '@chakra-ui/react'
import { type Address } from 'viem'
import { useSignMessage } from 'wagmi'

import { useAppKitAccount } from '@reown/appkit/react'

import { useChakraToast } from '@/src/components/Toast'
import { ConstantsUtil } from '@/src/utils/ConstantsUtil'
import { verifySignature } from '@/src/utils/SignatureUtil'

export function WagmiSignMessageTest() {
  const toast = useChakraToast()
  const { caipAddress, address, isConnected } = useAppKitAccount({ namespace: 'eip155' })

  const { signMessageAsync, isPending } = useSignMessage()

  const [currCaipAddress, setCurrCaipAddress] = React.useState<string | undefined>()
  const [signature, setSignature] = React.useState<string | undefined>()

  async function onVerifySignature() {
    if (!caipAddress || !signature) {
      toast({
        title: 'Verification Failed',
        description: 'Address and signature required',
        type: 'error'
      })

      return
    }

    const chainId = Number(caipAddress.split(':')[1])
    const parsedAddress = caipAddress.split(':')[2]

    try {
      const isValid = await verifySignature({
        address: parsedAddress as Address,
        message: 'Hello AppKit!',
        signature,
        chainId
      })

      toast({
        title: 'Signature Verification',
        description: isValid ? 'Valid signature' : 'Invalid signature',
        type: isValid ? 'success' : 'error'
      })
    } catch (e) {
      toast({
        title: 'Verification Failed',
        description: 'Failed to verify signature',
        type: 'error'
      })
    }
  }

  React.useEffect(() => {
    if (caipAddress !== currCaipAddress) {
      setCurrCaipAddress(caipAddress)
      setSignature(undefined)
    }
  }, [caipAddress])

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
      // eslint-disable-next-line no-console
      console.error('Failed to sign message', e)
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

      <Box mt={4}>
        <Button
          data-testid="verify-signature-button"
          onClick={onVerifySignature}
          isDisabled={!signature}
        >
          Verify Signature
        </Button>
      </Box>
    </>
  )
}

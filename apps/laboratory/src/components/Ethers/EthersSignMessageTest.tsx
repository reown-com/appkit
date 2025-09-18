import { useState } from 'react'

import { Box, Button } from '@chakra-ui/react'
import { BrowserProvider, JsonRpcSigner } from 'ethers'
import { type Address } from 'viem'

import { type Provider, useAppKitAccount, useAppKitProvider } from '@reown/appkit/react'

import { useChakraToast } from '@/src/components/Toast'
import { ConstantsUtil } from '@/src/utils/ConstantsUtil'
import { verifySignature } from '@/src/utils/SignatureUtil'

export function EthersSignMessageTest() {
  const toast = useChakraToast()
  const { caipAddress, address, isConnected } = useAppKitAccount({ namespace: 'eip155' })
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
        description: sig,
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

  return (
    <>
      <Button
        data-testid="sign-message-button"
        onClick={onSignMessage}
        isDisabled={!isConnected}
        width="auto"
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

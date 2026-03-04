'use client'

import { useState } from 'react'

import { Button, Flex, Stack, Text } from '@chakra-ui/react'

import { type TronConnector } from '@reown/appkit-adapter-tron'
import { useAppKitAccount, useAppKitProvider } from '@reown/appkit/react'

import { useChakraToast } from '@/src/components/Toast'
import { ConstantsUtil } from '@/src/utils/ConstantsUtil'

export function TronSignMessageTest() {
  const toast = useChakraToast()
  const { address, isConnected } = useAppKitAccount({ namespace: 'tron' })
  const { walletProvider } = useAppKitProvider<TronConnector>('tron')
  const [signature, setSignature] = useState<string | undefined>()

  async function signMessage() {
    try {
      if (!walletProvider || !isConnected || !address) {
        throw new Error('Disconnected')
      }
      const sig = await walletProvider.signMessage({
        message: 'Confirm action in AppKit',
        from: address
      })
      setSignature(sig)
      toast({ title: ConstantsUtil.SigningSucceededToastTitle, description: sig, type: 'success' })
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('TRON SignMessage error:', err)
      toast({
        title: ConstantsUtil.SigningFailedToastTitle,
        description: (err as Error)?.message || 'Failed to sign message',
        type: 'error'
      })
    }
  }

  if (!isConnected || !address) {
    return <Text color="yellow">Wallet not connected</Text>
  }

  return (
    <Flex flexDirection="column" gap="2" mb="2">
      <Stack direction="row" mt={3} gap={2}>
        <Button onClick={signMessage} data-testid="sign-message-button">
          Sign Message
        </Button>
      </Stack>
      {signature ? (
        <Text mt={3} data-testid="tron-signature" wordBreak="break-all">
          {signature}
        </Text>
      ) : null}
    </Flex>
  )
}

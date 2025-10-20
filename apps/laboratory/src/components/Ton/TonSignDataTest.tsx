'use client'

import { useState } from 'react'

import { Button, Flex, Stack, Text } from '@chakra-ui/react'

import { type TonConnector } from '@reown/appkit-adapter-ton'
import { useAppKitAccount, useAppKitProvider } from '@reown/appkit/react'

import { useChakraToast } from '@/src/components/Toast'
import { ConstantsUtil } from '@/src/utils/ConstantsUtil'

export function TonSignDataTest() {
  const toast = useChakraToast()
  const { address, isConnected } = useAppKitAccount({ namespace: 'ton' })
  const { walletProvider } = useAppKitProvider<TonConnector>('ton')
  const [signature, setSignature] = useState<string | undefined>()

  async function signText() {
    try {
      if (!walletProvider || !isConnected || !address) {
        throw new Error('Disconnected')
      }
      const sig = await walletProvider.signData({
        type: 'text',
        text: 'Confirm action in AppKit',
        from: address
      })
      setSignature(sig)
      toast({ title: ConstantsUtil.SigningSucceededToastTitle, description: sig, type: 'success' })
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('TON SignData error:', err)
      toast({
        title: ConstantsUtil.SigningFailedToastTitle,
        description: (err as Error)?.message || 'Failed to sign text',
        type: 'error'
      })
    }
  }

  async function signBinary() {
    try {
      if (!walletProvider || !isConnected || !address) {
        throw new Error('Disconnected')
      }
      const sig = await walletProvider.signData({
        type: 'binary',
        bytes: btoa('hello-ton'),
        from: address
      })
      setSignature(sig)
      toast({ title: ConstantsUtil.SigningSucceededToastTitle, description: sig, type: 'success' })
    } catch {
      toast({
        title: ConstantsUtil.SigningFailedToastTitle,
        description: 'Failed to sign binary',
        type: 'error'
      })
    }
  }

  async function signCell() {
    try {
      if (!walletProvider || !isConnected || !address) {
        throw new Error('Disconnected')
      }
      const sig = await walletProvider.signData({
        type: 'cell',
        schema: 'opaque',
        // Empty cell example
        cell: 'te6ccgEBAQEAAgAAAA==',
        from: address
      })
      setSignature(sig)
      toast({ title: ConstantsUtil.SigningSucceededToastTitle, description: sig, type: 'success' })
    } catch {
      toast({
        title: ConstantsUtil.SigningFailedToastTitle,
        description: 'Failed to sign cell',
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
        <Button onClick={signText}>Sign Text</Button>
        <Button onClick={signBinary} variant="outline" data-testid="sign-message-button">
          Sign Binary
        </Button>
        <Button onClick={signCell} variant="outline">
          Sign Cell
        </Button>
      </Stack>
      {signature ? (
        <Text mt={3} data-testid="ton-signature" wordBreak="break-all">
          {signature}
        </Text>
      ) : null}
    </Flex>
  )
}

'use client'

import { useState } from 'react'

import { Button, Card, CardBody, Heading, Stack, Text } from '@chakra-ui/react'

import type { TonConnector } from '@reown/appkit-utils/ton'
import { useAppKitAccount, useAppKitProvider } from '@reown/appkit/react'

import { useChakraToast } from '@/src/components/Toast'

export function TonSignDataTest() {
  const toast = useChakraToast()
  const { address, isConnected } = useAppKitAccount({ namespace: 'ton' })
  const { walletProvider } = useAppKitProvider<TonConnector>('ton')
  const [signature, setSignature] = useState<string | undefined>()

  async function signText() {
    try {
      console.log('>> walletProvider', walletProvider)
      if (!walletProvider || !isConnected || !address) throw new Error('Disconnected')
      const payload = { type: 'text', text: 'Confirm action in AppKit', from: address }
      const sig = await walletProvider.signData(payload)
      setSignature(sig)
      toast({ title: 'Signed (text)', description: sig, type: 'success' })
    } catch (err) {
      toast({
        title: 'Sign error',
        description: (err as Error)?.message || 'Failed to sign text',
        type: 'error'
      })
    }
  }

  async function signBinary() {
    try {
      if (!walletProvider || !isConnected || !address) throw new Error('Disconnected')
      const payload = { type: 'binary', bytes: btoa('hello-ton'), from: address }
      const sig = await walletProvider.signData({ data: payload })
      setSignature(sig)
      toast({ title: 'Signed (binary)', description: sig, type: 'success' })
    } catch {
      toast({ title: 'Sign error', description: 'Failed to sign binary', type: 'error' })
    }
  }

  async function signCell() {
    try {
      if (!walletProvider || !isConnected || !address) throw new Error('Disconnected')
      // Minimal example cell payload (dummy BoC)
      const payload = {
        type: 'cell',
        schema: 'opaque',
        cell: 'te6ccgEBAQEAAgAAAA==' /* empty cell example */,
        from: address
      }
      const sig = await walletProvider.signData({ data: payload })
      setSignature(sig)
      toast({ title: 'Signed (cell)', description: sig, type: 'success' })
    } catch {
      toast({ title: 'Sign error', description: 'Failed to sign cell', type: 'error' })
    }
  }

  if (!isConnected || !address) {
    return <Text color="yellow">Wallet not connected</Text>
  }

  return (
    <Card>
      <CardBody>
        <Heading size="sm">TON Sign Data</Heading>
        <Stack direction="row" mt={3} gap={2}>
          <Button onClick={signText}>Sign Text</Button>
          <Button onClick={signBinary} variant="outline">
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
      </CardBody>
    </Card>
  )
}

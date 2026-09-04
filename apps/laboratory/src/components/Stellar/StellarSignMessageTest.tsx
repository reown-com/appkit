'use client'

import { useState } from 'react'

import { Button, Stack, Text } from '@chakra-ui/react'

import type { StellarConnector } from '@reown/appkit-adapter-stellar'
import { useAppKitAccount, useAppKitProvider } from '@reown/appkit/react'

import { useChakraToast } from '@/src/components/Toast'

export function StellarSignMessageTest() {
  const toast = useChakraToast()
  const { address, isConnected } = useAppKitAccount({ namespace: 'stellar' })
  const { walletProvider } = useAppKitProvider<StellarConnector>('stellar')
  const [signature, setSignature] = useState<string | undefined>()

  async function onSignMessage() {
    try {
      if (!walletProvider || !isConnected || !address) {
        throw new Error('Disconnected')
      }

      const result = await walletProvider.signMessage({
        message: 'Hello Stellar from AppKit!',
        address
      })

      setSignature(result.signature)
      toast({ title: 'Message signed', description: result.signature, type: 'success' })
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('Stellar SignMessage error:', e)
      toast({
        title: 'Sign error',
        description: e instanceof Error ? e.message : 'Failed to sign message',
        type: 'error'
      })
    }
  }

  if (!isConnected || !address) {
    return <Text color="yellow">Wallet not connected</Text>
  }

  return (
    <Stack direction="column" gap={2}>
      <Button data-testid="sign-message-button" onClick={onSignMessage} width="auto">
        Sign Message
      </Button>
      {signature ? (
        <Text data-testid="stellar-signature" wordBreak="break-all">
          {signature}
        </Text>
      ) : null}
    </Stack>
  )
}

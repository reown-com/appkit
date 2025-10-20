'use client'

import { useState } from 'react'

import { Button, Flex, Input, Stack, Text } from '@chakra-ui/react'

import type { TonConnector } from '@reown/appkit-adapter-ton'
import { useAppKitAccount, useAppKitProvider } from '@reown/appkit/react'

import { useChakraToast } from '@/src/components/Toast'

export function TonSendMessageTest() {
  const toast = useChakraToast()
  const { address, isConnected } = useAppKitAccount({ namespace: 'ton' })
  const { walletProvider } = useAppKitProvider<TonConnector>('ton')
  const [to, setTo] = useState('UQA2A5SpYmHjygKewBWilkSc7twv1eTBuHOkWlUOLoXGV9Jg')
  // 0.02 TON in nanotons
  const [amount, setAmount] = useState('20000000')
  const [boc, setBoc] = useState<string | undefined>()

  async function onSend() {
    try {
      if (!walletProvider || !isConnected || !address) {
        throw new Error('Disconnected')
      }

      const res = await walletProvider.sendMessage({
        validUntil: Math.floor(Date.now() / 1000) + 60,
        from: address,
        messages: [
          {
            address: to,
            amount
          }
        ]
      })
      setBoc(res)
      toast({ title: 'Transaction prepared', description: res, type: 'success' })
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('TON SendMessage error:', e)
      toast({
        title: 'Send error',
        description: e instanceof Error ? e.message : 'Failed to send transaction',
        type: 'error'
      })
    }
  }

  if (!isConnected || !address) {
    return <Text color="yellow">Wallet not connected</Text>
  }

  return (
    <Flex flexDirection="column" gap="2" mb="2">
      <Stack display={'flex'} direction="row" mt={3} gap={2}>
        <Input
          value={to}
          onChange={e => setTo(e.target.value)}
          placeholder="to (user-friendly)"
          flex={1}
        />
        <Input
          value={amount}
          onChange={e => setAmount(e.target.value)}
          placeholder="amount (nanotons)"
          flex={1}
        />
        <Button width="auto" onClick={onSend}>
          Send {Number(amount) / 1e9} TON
        </Button>
      </Stack>
      {boc ? (
        <Text mt={3} data-testid="ton-boc" wordBreak="break-all">
          {boc}
        </Text>
      ) : null}
    </Flex>
  )
}

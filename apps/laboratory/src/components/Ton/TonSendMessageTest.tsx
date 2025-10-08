'use client'

import { useState } from 'react'

import { Button, Card, CardBody, Heading, Input, Stack, Text } from '@chakra-ui/react'

import { useAppKitAccount, useAppKitProvider } from '@reown/appkit/react'

import { useChakraToast } from '@/src/components/Toast'

export function TonSendMessageTest() {
  const toast = useChakraToast()
  const { address, isConnected } = useAppKitAccount({ namespace: 'ton' })
  const { walletProvider } = useAppKitProvider<any>('ton')
  const [to, setTo] = useState('EQBBJBB3HagsujBqVfqeDUPJ0kXjgTPLWPFFffuNXNiJL0aA')
  const [amount, setAmount] = useState('20000000') // 0.02 TON in nanotons
  const [boc, setBoc] = useState<string | undefined>()

  async function onSend() {
    try {
      if (!walletProvider || !isConnected || !address) throw new Error('Disconnected')
      const tx = {
        validUntil: Math.floor(Date.now() / 1000) + 60,
        from: address,
        messages: [
          {
            address: to,
            amount
          }
        ]
      }
      const res = await walletProvider.sendMessage({ transaction: tx })
      setBoc(res)
      toast({ title: 'Transaction prepared', description: res, type: 'success' })
    } catch (e) {
      console.log('>> e', e)
      toast({ title: 'Send error', description: 'Failed to send transaction', type: 'error' })
    }
  }

  if (!isConnected || !address) {
    return <Text color="yellow">Wallet not connected</Text>
  }

  return (
    <Card>
      <CardBody>
        <Heading size="sm">TON Send Transaction</Heading>
        <Stack direction="row" mt={3} gap={2}>
          <Input
            value={to}
            onChange={e => setTo(e.target.value)}
            placeholder="to (user-friendly)"
          />
          <Input
            value={amount}
            onChange={e => setAmount(e.target.value)}
            placeholder="amount (nanotons)"
          />
          <Button onClick={onSend}>Send</Button>
        </Stack>
        {boc ? (
          <Text mt={3} data-testid="ton-boc" wordBreak="break-all">
            {boc}
          </Text>
        ) : null}
      </CardBody>
    </Card>
  )
}

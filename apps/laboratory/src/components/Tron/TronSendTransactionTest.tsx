'use client'

import { useState } from 'react'

import { Button, Flex, Input, Stack, Text } from '@chakra-ui/react'

import type { TronConnector } from '@reown/appkit-adapter-tron'
import { useAppKitAccount, useAppKitProvider } from '@reown/appkit/react'

import { useChakraToast } from '@/src/components/Toast'

export function TronSendTransactionTest() {
  const toast = useChakraToast()
  const { address, isConnected } = useAppKitAccount({ namespace: 'tron' })
  const { walletProvider } = useAppKitProvider<TronConnector>('tron')
  const [to, setTo] = useState('TN9RRaXkCFtTXRso2GdTZxSxxwufzxLQPP')
  // 1 TRX in SUN (1 TRX = 1,000,000 SUN)
  const [amount, setAmount] = useState('1000000')
  const [txHash, setTxHash] = useState<string | undefined>()

  async function onSend() {
    try {
      if (!walletProvider || !isConnected || !address) {
        throw new Error('Disconnected')
      }

      const res = await walletProvider.sendTransaction({
        to,
        from: address,
        value: amount
      })
      setTxHash(res)
      toast({ title: 'Transaction sent', description: res, type: 'success' })
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('TRON SendTransaction error:', e)
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
          placeholder="to (base58 address)"
          flex={1}
        />
        <Input
          value={amount}
          onChange={e => setAmount(e.target.value)}
          placeholder="amount (SUN)"
          flex={1}
        />
        <Button width="auto" onClick={onSend}>
          Send {Number(amount) / 1e6} TRX
        </Button>
      </Stack>
      {txHash ? (
        <Text mt={3} data-testid="tron-txhash" wordBreak="break-all">
          {txHash}
        </Text>
      ) : null}
    </Flex>
  )
}

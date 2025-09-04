import { useState } from 'react'

import { Box, Button, Input, InputGroup, InputLeftAddon } from '@chakra-ui/react'

import type { BitcoinConnector } from '@reown/appkit-adapter-bitcoin'
import { useAppKitAccount, useAppKitProvider } from '@reown/appkit/react'

import { useChakraToast } from '@/src/components/Toast'

export function BitcoinSendTransferTest() {
  const { walletProvider } = useAppKitProvider<BitcoinConnector>('bip122')
  const { address } = useAppKitAccount({ namespace: 'bip122' })
  const toast = useChakraToast()

  const [isLoading, setIsLoading] = useState(false)
  const [recipient, setRecipient] = useState<string>(address || '')
  const [amount, setAmount] = useState<string>('1500')

  async function onSendTransfer() {
    if (!walletProvider) {
      toast({
        title: 'No wallet provider',
        description: 'Please connect your wallet',
        type: 'error'
      })
    }

    try {
      setIsLoading(true)
      const signature = await walletProvider.sendTransfer({
        recipient,
        amount
      })

      toast({
        title: 'Success',
        description: `Transfer sent: ${signature}`,
        type: 'success'
      })
    } catch (error) {
      toast({ title: 'Error', description: (error as Error).message, type: 'error' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Box display="flex" width="100%" gap="2" mb="2">
        <InputGroup>
          <InputLeftAddon>Recipient</InputLeftAddon>
          <Input value={recipient} onChange={e => setRecipient(e.currentTarget.value)} />
        </InputGroup>

        <InputGroup>
          <InputLeftAddon>Amount</InputLeftAddon>
          <Input value={amount} onChange={e => setAmount(e.currentTarget.value)} type="number" />
        </InputGroup>
      </Box>

      <Button
        data-testid="send-transfer-button"
        onClick={onSendTransfer}
        width="auto"
        isLoading={isLoading}
      >
        Send Transfer
      </Button>
    </>
  )
}

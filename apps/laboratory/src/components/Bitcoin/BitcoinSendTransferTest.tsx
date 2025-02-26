import { useState } from 'react'

import { Box, Button, Input, InputGroup, InputLeftAddon, useToast } from '@chakra-ui/react'

import type { BitcoinConnector } from '@reown/appkit-adapter-bitcoin'
import { useAppKitAccount, useAppKitProvider } from '@reown/appkit/react'

export function BitcoinSendTransferTest() {
  const { walletProvider } = useAppKitProvider<BitcoinConnector>('bip122')
  const { address } = useAppKitAccount({ namespace: 'bip122' })

  const toast = useToast()
  const [loading, setLoading] = useState(false)
  const [recipient, setRecipient] = useState<string>(address || '')
  const [amount, setAmount] = useState<string>('1500')

  async function onSendTransfer() {
    if (!walletProvider) {
      toast({
        title: 'No wallet provider',
        status: 'error',
        isClosable: true
      })
    }

    try {
      setLoading(true)
      const signature = await walletProvider.sendTransfer({
        recipient,
        amount
      })

      toast({
        title: `Transfer sent: ${signature}`,
        status: 'success',
        isClosable: true
      })
    } catch (error) {
      toast({ title: 'Error', description: (error as Error).message, status: 'error' })
    } finally {
      setLoading(false)
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
        isLoading={loading}
      >
        Send Transfer
      </Button>
    </>
  )
}

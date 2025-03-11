import { useState } from 'react'

import { Box, Button, Input, InputGroup, InputLeftAddon } from '@chakra-ui/react'

import type { BitcoinConnector } from '@reown/appkit-adapter-bitcoin'
import { useAppKitAccount, useAppKitProvider } from '@reown/appkit/react'

import { useChakraToast } from '@/src/components/Toast'

export function BitcoinSignMessageTest() {
  const { walletProvider } = useAppKitProvider<BitcoinConnector>('bip122')
  const { address } = useAppKitAccount({ namespace: 'bip122' })
  const toast = useChakraToast()

  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string>('Hello, World!')

  async function onSignMessage() {
    if (!walletProvider || !address) {
      throw Error('No connection detected')
    }

    setLoading(true)

    try {
      const signature = await walletProvider.signMessage({
        address,
        message
      })
      toast({ title: 'Success', description: signature, type: 'success' })
    } catch (error) {
      toast({ title: 'Error', description: (error as Error).message, type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Box display="flex" width="100%" gap="2" mb="2">
        <InputGroup>
          <InputLeftAddon>Message</InputLeftAddon>
          <Input value={message} onChange={e => setMessage(e.currentTarget.value)} />
        </InputGroup>
      </Box>

      <Button
        data-testid="sign-message-button"
        onClick={onSignMessage}
        width="auto"
        isLoading={loading}
      >
        Sign Message
      </Button>
    </>
  )
}

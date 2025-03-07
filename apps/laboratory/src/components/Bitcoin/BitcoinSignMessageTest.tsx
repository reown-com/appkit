import { useState } from 'react'

import { Box, Button, Input, InputGroup, InputLeftAddon, useToast } from '@chakra-ui/react'

import type { BitcoinConnector } from '@reown/appkit-adapter-bitcoin'
import { useAppKitAccount, useAppKitProvider } from '@reown/appkit/react'

export function BitcoinSignMessageTest() {
  const { walletProvider } = useAppKitProvider<BitcoinConnector>('bip122')
  const { address } = useAppKitAccount({ namespace: 'bip122' })

  const toast = useToast()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string>('Hello, World!')

  async function onSignMessage() {
    if (!walletProvider || !address) {
      toast({
        title: 'No connection detected',
        status: 'error',
        isClosable: true
      })

      return
    }

    setLoading(true)

    try {
      const signature = await walletProvider.signMessage({
        address,
        message
      })
      toast({ title: 'Signature', description: signature, status: 'success' })
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

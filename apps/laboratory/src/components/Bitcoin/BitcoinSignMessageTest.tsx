import { useState } from 'react'

import { Box, Button, Input, InputGroup, InputLeftAddon } from '@chakra-ui/react'

import type { BitcoinConnector } from '@reown/appkit-adapter-bitcoin'
import { useAppKitAccount, useAppKitProvider } from '@reown/appkit/react'

import { useChakraToast } from '@/src/components/Toast'
import { ConstantsUtil } from '@/src/utils/ConstantsUtil'

export function BitcoinSignMessageTest() {
  const toast = useChakraToast()
  const { walletProvider } = useAppKitProvider<BitcoinConnector>('bip122')
  const { address } = useAppKitAccount({ namespace: 'bip122' })

  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<string>('Hello, World!')
  const [protocol, setProtocol] = useState<'bip322' | 'ecdsa'>()
  async function onSignMessage() {
    if (!walletProvider || !address) {
      throw Error('No connection detected')
    }

    setIsLoading(true)

    try {
      const signature = await walletProvider.signMessage({
        address,
        message,
        protocol
      })
      toast({
        title: ConstantsUtil.SigningSucceededToastTitle,
        description: signature,
        type: 'success'
      })
    } catch (error) {
      toast({
        title: ConstantsUtil.SigningFailedToastTitle,
        description: (error as Error).message,
        type: 'error'
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Box display="flex" width="100%" gap="2" mb="2" flexDirection="column">
        <InputGroup>
          <InputLeftAddon>Message</InputLeftAddon>
          <Input value={message} onChange={e => setMessage(e.currentTarget.value)} />
        </InputGroup>
        <InputGroup>
          <InputLeftAddon>Protocol</InputLeftAddon>
          <Input
            as="select"
            value={protocol}
            onChange={e => setProtocol(e.currentTarget.value as 'bip322' | 'ecdsa')}
          >
            <option value="">Select</option>
            <option value="bip322">BIP-322</option>
            <option value="ecdsa">ECDSA</option>
          </Input>
        </InputGroup>
      </Box>

      <Button
        data-testid="sign-message-button"
        onClick={onSignMessage}
        width="auto"
        isLoading={isLoading}
      >
        Sign Message
      </Button>
    </>
  )
}

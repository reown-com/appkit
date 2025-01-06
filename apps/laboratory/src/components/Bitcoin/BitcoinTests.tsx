import * as React from 'react'
import { useAppKitAccount, useAppKitBitcoinPublicKey } from '@reown/appkit/react'
import { StackDivider, Card, CardHeader, Heading, CardBody, Box, Stack } from '@chakra-ui/react'
import { BitcoinSignMessageTest } from './BitcoinSignMessageTest'
import { BitcoinSendTransferTest } from './BitcoinSendTransferTest'
import { BitcoinSignPSBTTest } from './BitcoinSignPSBTTest'

export function BitcoinTests() {
  const { caipAddress } = useAppKitAccount()
  const { getPublicKey } = useAppKitBitcoinPublicKey()
  const { isConnected } = useAppKitAccount()
  const [publicKey, setPublicKey] = React.useState<string | undefined>(undefined)

  async function getKey() {
    const key = await getPublicKey?.()
    if (caipAddress) {
      setPublicKey(key)
    }
  }

  React.useEffect(() => {
    getKey()
  }, [caipAddress])

  if (!isConnected) {
    return null
  }

  return (
    <Card marginTop={10} marginBottom={10}>
      <CardHeader>
        <Heading size="md">Test Interactions</Heading>
      </CardHeader>

      <CardBody>
        <Stack divider={<StackDivider />} spacing="4">
          <Box>
            <Heading size="xs" textTransform="uppercase" pb="2">
              Public Key
            </Heading>
            {publicKey}
          </Box>
          <Box>
            <Heading size="xs" textTransform="uppercase" pb="2">
              Sign Message Test
            </Heading>
            <BitcoinSignMessageTest />
          </Box>

          <Box>
            <Heading size="xs" textTransform="uppercase" pb="2">
              Sign PSBT Test
            </Heading>
            <BitcoinSignPSBTTest />
          </Box>

          <Box>
            <Heading size="xs" textTransform="uppercase" pb="2">
              Send Transfer Test
            </Heading>
            <BitcoinSendTransferTest />
          </Box>
        </Stack>
      </CardBody>
    </Card>
  )
}

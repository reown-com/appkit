import { useAccount } from 'wagmi'
import { WagmiTransactionTest } from './WagmiTransactionTest'
import { WagmiSignMessageTest } from './WagmiSignMessageTest'
import { WagmiSignTypedDataTest } from './WagmiSignTypedDataTest'
import { StackDivider, Card, CardHeader, Heading, CardBody, Box, Stack } from '@chakra-ui/react'

export function WagmiTests() {
  const { isConnected } = useAccount()

  return isConnected ? (
    <Card marginTop={10} marginBottom={10}>
      <CardHeader>
        <Heading size="md">Test Interactions</Heading>
      </CardHeader>

      <CardBody>
        <Stack divider={<StackDivider />} spacing="4">
          <Box>
            <Heading size="xs" textTransform="uppercase">
              Sign Message
            </Heading>
            <WagmiSignMessageTest />
          </Box>

          <Box>
            <Heading size="xs" textTransform="uppercase">
              Sign Typed Data
            </Heading>
            <WagmiSignTypedDataTest />
          </Box>

          <Box>
            <Heading size="xs" textTransform="uppercase">
              Sign Transaction
            </Heading>
            <WagmiTransactionTest />
          </Box>
        </Stack>
      </CardBody>
    </Card>
  ) : null
}

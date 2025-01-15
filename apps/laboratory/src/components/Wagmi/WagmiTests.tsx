import { Box, Card, CardBody, CardHeader, Heading, Stack, StackDivider } from '@chakra-ui/react'
import type { Config } from 'wagmi'

import { WagmiDisconnectTest } from './WagmiDisconnectTest'
import { WagmiGetCallsStatusTest } from './WagmiGetCallsStatusTest'
import { WagmiSendCallsTest } from './WagmiSendCallsTest'
import { WagmiSendCallsWithPaymasterServiceTest } from './WagmiSendCallsWithPaymasterServiceTest'
import { WagmiSendUSDCTest } from './WagmiSendUSDCTest'
import { WagmiSignMessageTest } from './WagmiSignMessageTest'
import { WagmiSignTypedDataTest } from './WagmiSignTypedDataTest'
import { WagmiTransactionTest } from './WagmiTransactionTest'
import { WagmiWriteContractTest } from './WagmiWriteContractTest'

interface IProps {
  config?: Config
}

export function WagmiTests({ config }: IProps) {
  return (
    <Card marginTop={10} marginBottom={10}>
      <CardHeader>
        <Heading size="md">Test Interactions</Heading>
      </CardHeader>
      <CardBody>
        <Stack divider={<StackDivider />} spacing="4">
          <Box>
            <Heading size="xs" textTransform="uppercase" pb="2">
              Sign Message
            </Heading>
            <WagmiSignMessageTest />
          </Box>

          <Box>
            <Heading size="xs" textTransform="uppercase" pb="2">
              Sign Typed Data
            </Heading>
            <WagmiSignTypedDataTest />
          </Box>

          <Box>
            <Heading size="xs" textTransform="uppercase" pb="2">
              Sign Transaction
            </Heading>
            <WagmiTransactionTest />
          </Box>

          <Box>
            <Heading size="xs" textTransform="uppercase" pb="2">
              Contract Write
            </Heading>
            <WagmiWriteContractTest />
          </Box>

          <Box>
            <Heading size="xs" textTransform="uppercase" pb="2">
              USDC Send
            </Heading>
            <WagmiSendUSDCTest config={config} />
          </Box>
          <Box>
            <Heading size="xs" textTransform="uppercase" pb="2">
              Send Calls (Atomic Batch)
            </Heading>
            <WagmiSendCallsTest />
          </Box>

          <Box>
            <Heading size="xs" textTransform="uppercase" pb="2">
              Get Calls Status
            </Heading>
            <WagmiGetCallsStatusTest />
          </Box>

          <Box>
            <Heading size="xs" textTransform="uppercase" pb="2">
              Send Calls (Paymaster Service)
            </Heading>
            <WagmiSendCallsWithPaymasterServiceTest />
          </Box>

          <Box>
            <Heading size="xs" textTransform="uppercase" pb="2">
              Disconnect
            </Heading>
            <WagmiDisconnectTest />
          </Box>
        </Stack>
      </CardBody>
    </Card>
  )
}

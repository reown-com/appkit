import {
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Code,
  Heading,
  Stack,
  StackDivider,
  Text
} from '@chakra-ui/react'
import type { Config } from 'wagmi'

import { useAppKitAccount } from '@reown/appkit/react'

import { useWagmiAvailableCapabilities } from '@/src/hooks/useWagmiActiveCapabilities'

import { WagmiDisconnectTest } from './WagmiDisconnectTest'
import { WagmiGetCallsStatusTest } from './WagmiGetCallsStatusTest'
import { WagmiSendCallsCustomAbiWithPaymasterServiceTest } from './WagmiSendCallsCustomAbiWithPaymasterServiceTest'
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
  const { address } = useAppKitAccount({ namespace: 'eip155' })
  const { availableCapabilities, fetchCapabilities, hasFetchedCapabilities, capabilitiesToRender, isMethodSupported } =
    useWagmiAvailableCapabilities()

  if (!address) {
    return null
  }

  return (
    <Card data-testid="eip155-test-interactions" marginTop={10} marginBottom={10}>
      <CardHeader>
        <Heading size="md">Wagmi Test Interactions</Heading>
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
              EIP-5792 Capabilities
            </Heading>
            <Button onClick={fetchCapabilities} data-testid="fetch-capabilities-button">
              {hasFetchedCapabilities ? 'Re-fetch' : 'Fetch'}
            </Button>

            {/* Debug: Raw wallet_getCapabilities */}
            <Box mt={2}>
              <Text fontWeight="bold" color="gray.500">Raw wallet_getCapabilities</Text>
              <Box as="pre" fontSize="xs" color="purple.600" bg="gray.50" p={2} borderRadius="md" overflowX="auto">
                {availableCapabilities ? JSON.stringify(availableCapabilities, null, 2) : 'No data fetched yet'}
              </Box>
            </Box>

            {/* Debug: Rendered capabilities summary */}
            <Box mt={2}>
              <Text fontWeight="bold" color="gray.500">Rendered Capabilities Summary</Text>
              <Box as="pre" fontSize="xs" color="purple.600" bg="gray.50" p={2} borderRadius="md" overflowX="auto">
                {capabilitiesToRender ? JSON.stringify(capabilitiesToRender, null, 2) : 'No rendered capabilities'}
              </Box>
            </Box>

            {/* Debug: Method support sampling */}
            <Box mt={2}>
              <Text fontWeight="bold" color="gray.500">Method Support</Text>
              <Text fontSize="xs" color="blue.600">wallet_sendCalls: {String(isMethodSupported?.('wallet_sendCalls'))}</Text>
              <Text fontSize="xs" color="blue.600">wallet_getCallsStatus: {String(isMethodSupported?.('wallet_getCallsStatus'))}</Text>
              <Text fontSize="xs" color="blue.600">wallet_grantPermissions: {String(isMethodSupported?.('wallet_grantPermissions'))}</Text>
            </Box>
          </Box>

          <Box>
            <Heading size="xs" textTransform="uppercase" pb="2">
              Send Calls (Atomic Batch)
            </Heading>
            {/* Pass capabilities down so tests use the same data */}
            {capabilitiesToRender ? <WagmiSendCallsTest capabilities={capabilitiesToRender} /> : null}
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
            {capabilitiesToRender ? (
              <WagmiSendCallsWithPaymasterServiceTest capabilities={capabilitiesToRender} />
            ) : null}
          </Box>

          <Box>
            <Heading size="xs" textTransform="uppercase" pb="2">
              Send Calls with custom abi (Paymaster Service)
            </Heading>
            {capabilitiesToRender ? (
              <WagmiSendCallsCustomAbiWithPaymasterServiceTest capabilities={capabilitiesToRender} />
            ) : null}
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

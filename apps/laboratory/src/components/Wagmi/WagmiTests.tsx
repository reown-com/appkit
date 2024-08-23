import { WagmiTransactionTest } from './WagmiTransactionTest'
import { WagmiSignMessageTest } from './WagmiSignMessageTest'
import { WagmiSignTypedDataTest } from './WagmiSignTypedDataTest'
import {
  StackDivider,
  Card,
  CardHeader,
  Heading,
  CardBody,
  Box,
  Stack,
  Button
} from '@chakra-ui/react'
import { WagmiWriteContractTest } from './WagmiWriteContractTest'
import { WagmiSendUSDCTest } from './WagmiSendUSDCTest'
import { WagmiSendCallsTest } from './WagmiSendCallsTest'
import { WagmiGetCallsStatusTest } from './WagmiGetCallsStatusTest'
import { WagmiSendCallsWithPaymasterServiceTest } from './WagmiSendCallsWithPaymasterServiceTest'
import { useWeb3Modal } from '@web3modal/wagmi/react'

export function WagmiTests() {
  const { open } = useWeb3Modal()

  return (
    <Card marginTop={10} marginBottom={10}>
      <CardHeader>
        <Heading size="md">Test Interactions</Heading>
      </CardHeader>
      <CardBody>
        <Stack divider={<StackDivider />} spacing="4">
          <Box>
            <Heading size="xs" textTransform="uppercase" pb="2">
              Hook Interactions
            </Heading>
            <Button onClick={() => open()}>Open</Button>
          </Box>
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
            <WagmiSendUSDCTest />
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
        </Stack>
      </CardBody>
    </Card>
  )
}

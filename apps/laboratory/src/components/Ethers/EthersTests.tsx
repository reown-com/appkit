import * as React from 'react'

import {
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Code,
  Heading,
  Stack,
  StackDivider
} from '@chakra-ui/react'

import { useAppKitAccount } from '@reown/appkit/react'

import { useEthersActiveCapabilities } from '@/src/hooks/useEthersActiveCapabilities'

import { EthersGetCallsStatusTest } from './EthersGetCallsStatusTest'
import { EthersSendCallsTest } from './EthersSendCallsTest'
import { EthersSendCallsWithPaymasterServiceTest } from './EthersSendCallsWithPaymasterServiceTest'
import { EthersSignMessageTest } from './EthersSignMessageTest'
import { EthersSignTypedDataTest } from './EthersSignTypedDataTest'
import { EthersTransactionTest } from './EthersTransactionTest'
import { EthersWriteContractTest } from './EthersWriteContractTest'

export function EthersTests() {
  const [ready, setReady] = React.useState(false)

  const [callsHash, setCallsHash] = React.useState<string>('')

  const { capabilities, fetchCapabilities, hasFetchedCapabilities, capabilitiesToRender } =
    useEthersActiveCapabilities()
  const { isConnected } = useAppKitAccount({ namespace: 'eip155' })

  const onCallsHash = React.useCallback((hash: string) => {
    setCallsHash(hash)
  }, [])

  React.useEffect(() => {
    if (!isConnected) {
      setCallsHash('')
    }
  }, [isConnected])

  React.useEffect(() => {
    setReady(true)
  }, [])

  if (!ready) {
    return null
  }

  return isConnected ? (
    <Card data-testid="eip155-test-interactions" marginTop={10} marginBottom={10}>
      <CardHeader>
        <Heading size="md">Ethers Test Interactions</Heading>
      </CardHeader>

      <CardBody>
        <Stack divider={<StackDivider />} spacing="4">
          <Box>
            <Heading size="xs" textTransform="uppercase" pb="2">
              Sign Message
            </Heading>
            <EthersSignMessageTest />
          </Box>

          <Box>
            <Heading size="xs" textTransform="uppercase" pb="2">
              Sign Typed Data
            </Heading>
            <EthersSignTypedDataTest />
          </Box>

          <Box>
            <Heading size="xs" textTransform="uppercase" pb="2">
              Sign Transaction
            </Heading>
            <EthersTransactionTest />
          </Box>
          <Box>
            <Heading size="xs" textTransform="uppercase" pb="2">
              Contract Write
            </Heading>
            <EthersWriteContractTest />
          </Box>
          <Box>
            <Heading size="xs" textTransform="uppercase" pb="2">
              EIP-5792 Capabilities
            </Heading>
            <Button onClick={fetchCapabilities} data-testid="fetch-capabilities-button">
              {hasFetchedCapabilities ? 'Re-fetch' : 'Fetch'} Capabilities
            </Button>
            <br />
            <Code marginTop={2} whiteSpace="pre-wrap">
              {capabilitiesToRender}
            </Code>
          </Box>
          {capabilities && (
            <Box>
              <Heading size="xs" textTransform="uppercase" pb="2">
                Send Calls (Atomic Batch)
              </Heading>
              <EthersSendCallsTest onCallsHash={onCallsHash} capabilities={capabilities} />
            </Box>
          )}
          {capabilities && (
            <Box>
              <Heading size="xs" textTransform="uppercase" pb="2">
                Get Calls Status
              </Heading>
              <EthersGetCallsStatusTest callsHash={callsHash} />
            </Box>
          )}
          {capabilities && (
            <Box>
              <Heading size="xs" textTransform="uppercase" pb="2">
                Send Calls (Paymaster Service)
              </Heading>
              <EthersSendCallsWithPaymasterServiceTest capabilities={capabilities} />
            </Box>
          )}
        </Stack>
      </CardBody>
    </Card>
  ) : null
}

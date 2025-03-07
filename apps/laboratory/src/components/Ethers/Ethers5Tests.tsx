import * as React from 'react'

import { Box, Card, CardBody, CardHeader, Heading, Stack, StackDivider } from '@chakra-ui/react'

import { useAppKitAccount } from '@reown/appkit/react'

import { EthersGetCallsStatusTest } from './EthersGetCallsStatusTest'
import { EthersSendCallsTest } from './EthersSendCallsTest'
import { EthersSendCallsWithPaymasterServiceTest } from './EthersSendCallsWithPaymasterServiceTest'
import { EthersSignMessageTest } from './EthersSignMessageTest'
import { EthersSignTypedDataTest } from './EthersSignTypedDataTest'
import { EthersTransactionTest } from './EthersTransactionTest'
import { EthersWriteContractTest } from './EthersWriteContractTest'

export function Ethers5Tests() {
  const [ready, setReady] = React.useState(false)
  const [callsHash, setCallsHash] = React.useState<string>('')
  const { isConnected } = useAppKitAccount({ namespace: 'eip155' })

  React.useEffect(() => {
    setReady(true)
  }, [])

  if (!ready) {
    return null
  }

  return isConnected ? (
    <Card data-testid="eip155-test-interactions" marginTop={10} marginBottom={10}>
      <CardHeader>
        <Heading size="md">Ethers 5 Test Interactions</Heading>
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
              Send Calls (Atomic Batch)
            </Heading>
            <EthersSendCallsTest onCallsHash={setCallsHash} />
          </Box>
          <Box>
            <Heading size="xs" textTransform="uppercase" pb="2">
              Get Calls Status
            </Heading>
            <EthersGetCallsStatusTest callsHash={callsHash} />
          </Box>
          <Box>
            <Heading size="xs" textTransform="uppercase" pb="2">
              Send Calls (Paymaster Service)
            </Heading>
            <EthersSendCallsWithPaymasterServiceTest />
          </Box>
        </Stack>
      </CardBody>
    </Card>
  ) : null
}

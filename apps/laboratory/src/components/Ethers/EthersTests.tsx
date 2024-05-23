import * as React from 'react'
import { useWeb3ModalAccount } from '@web3modal/ethers/react'
import { EthersSignMessageTest } from './EthersSignMessageTest'
import { EthersSignTypedDataTest } from './EthersSignTypedDataTest'
import { StackDivider, Card, CardHeader, Heading, CardBody, Box, Stack } from '@chakra-ui/react'
import { EthersTransactionTest } from './EthersTransactionTest'
import { EthersWriteContractTest } from './EthersWriteContractTest'

export function EthersTests() {
  const [ready, setReady] = React.useState(false)
  const { isConnected } = useWeb3ModalAccount()

  React.useEffect(() => {
    setReady(true)
  }, [])

  if (!ready) {
    return null
  }

  return isConnected ? (
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
        </Stack>
      </CardBody>
    </Card>
  ) : null
}

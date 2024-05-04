import * as React from 'react'
import { useWeb3ModalAccount } from '@web3modal/web3/react'
import { Web3SignMessageTest } from './Web3SignMessageTest'
import { Web3SignTypedDataTest } from './Web3SignTypedDataTest'
import { StackDivider, Card, CardHeader, Heading, CardBody, Box, Stack } from '@chakra-ui/react'
import { Web3TransactionTest } from './Web3TransactionTest'
import { Web3WriteContractTest } from './Web3WriteContractTest'

export function Web3Tests() {
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
            <Web3SignMessageTest />
          </Box>

          <Box>
            <Heading size="xs" textTransform="uppercase" pb="2">
              Sign Typed Data
            </Heading>
            <Web3SignTypedDataTest />
          </Box>

          <Box>
            <Heading size="xs" textTransform="uppercase" pb="2">
              Sign Transaction
            </Heading>
            <Web3TransactionTest />
          </Box>
          <Box>
            <Heading size="xs" textTransform="uppercase" pb="2">
              Contract Write
            </Heading>
            <Web3WriteContractTest />
          </Box>
        </Stack>
      </CardBody>
    </Card>
  ) : null
}

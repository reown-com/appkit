import { useWeb3ModalAccount } from '@web3modal/solana/react'
import { StackDivider, Card, CardHeader, Heading, CardBody, Box, Stack } from '@chakra-ui/react'

import { SolanaSignTransactionTest } from './SolanaSignTransactionTest'
import { SolanaSendTransactionTest } from './SolanaSendTransactionTest'
import { SolanaSignMessageTest } from "./SolanaSignMessageTest"
import { SolanaSignTypedDataTest } from "./SolanaSignTypedDataTest"

export function SolanaTests() {
  const { isConnected } = useWeb3ModalAccount()

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
            <SolanaSignMessageTest />
          </Box>
          <Box>
            <Heading size="xs" textTransform="uppercase" pb="2">
              Sign Typed Data
            </Heading>
            <SolanaSignTypedDataTest />
          </Box>
          <Box>
            <Heading size="xs" textTransform="uppercase" pb="2">
              Sign Transaction
            </Heading>
            <SolanaSignTransactionTest />
          </Box>
          <Box>
            <Heading size="xs" textTransform="uppercase" pb="2">
              Sign and Send Transaction
            </Heading>
            <SolanaSendTransactionTest />
          </Box>
        </Stack>
      </CardBody>
    </Card>
  ) : null
}

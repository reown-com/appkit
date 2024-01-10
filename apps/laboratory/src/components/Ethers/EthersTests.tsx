import { useWeb3ModalAccount } from '@web3modal/ethers/react'
import { EthersSignMessageTest } from './EthersSignMessageTest'
import { EthersSignTypedDataTest } from './EthersSignTypedDataTest'
import { StackDivider, Card, CardHeader, Heading, CardBody, Box, Stack } from '@chakra-ui/react'
import { EthersTransactionTest } from './EthersTransactionTest'
import { EthersMintTest } from './EthersMintTest'

export function EthersTests() {
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
              Purchase a Crypto Donut
            </Heading>
            <EthersMintTest />
          </Box>
        </Stack>
      </CardBody>
    </Card>
  ) : null
}

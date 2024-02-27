import { useWeb3ModalAccount } from '@web3modal/solana/react'
import { StackDivider, Card, CardHeader, Heading, CardBody, Box, Stack, Text } from '@chakra-ui/react'

import { SolanaSignTransactionTest } from './SolanaSignTransactionTest'
import { SolanaSendTransactionTest } from './SolanaSendTransactionTest'
import { SolanaSignMessageTest } from "./SolanaSignMessageTest"
import { solana } from "../../utils/ChainsUtil";

export function SolanaTests() {
  const { isConnected, currentChain } = useWeb3ModalAccount()

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
          {
            currentChain?.chainId !== solana.chainId && (
              <Box>
                <Text fontSize="md" color="yellow">
                  Please ensure your wallet is connected to the {currentChain?.name}
                </Text>
              </Box>
            )
          }
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

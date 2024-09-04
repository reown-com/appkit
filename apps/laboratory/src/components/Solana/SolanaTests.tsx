import { useWeb3ModalAccount, useWeb3ModalNetwork } from '@rerock/base/react'
import {
  StackDivider,
  Card,
  CardHeader,
  Heading,
  CardBody,
  Box,
  Stack,
  Text,
  Tooltip
} from '@chakra-ui/react'

import { SolanaSignTransactionTest } from './SolanaSignTransactionTest'
import { SolanaSendTransactionTest } from './SolanaSendTransactionTest'
import { SolanaSignMessageTest } from './SolanaSignMessageTest'
import { SolanaWriteContractTest } from './SolanaWriteContractTest'
import { solana, solanaDevnet, solanaTestnet } from '@rerock/base/chains'
import { SolanaSignAndSendTransaction } from './SolanaSignAndSendTransactionTest'
import { SolanaSignAllTransactionsTest } from './SolanaSignAllTransactionsTest'

export function SolanaTests() {
  const { isConnected } = useWeb3ModalAccount()
  const { caipNetwork } = useWeb3ModalNetwork()

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
          {caipNetwork?.chainId !== solana.chainId && (
            <Box>
              <Text fontSize="md" color="yellow">
                Please ensure your wallet is connected to the {caipNetwork?.name}
              </Text>
            </Box>
          )}
          <Box>
            <Heading size="xs" textTransform="uppercase" pb="2">
              Sign Transaction
            </Heading>
            <SolanaSignTransactionTest />
          </Box>
          <Box>
            <Heading size="xs" textTransform="uppercase" pb="2">
              Sign All Transactions
              <Tooltip label="Request the signature for 5 transactions at once">
                <Text as="span" fontSize="sm" ml="2">
                  ℹ️
                </Text>
              </Tooltip>
            </Heading>
            <SolanaSignAllTransactionsTest />
          </Box>

          <Box>
            <Heading size="xs" textTransform="uppercase" pb="2">
              Sign and Send Transaction (Dapp)
              <Tooltip label="The transaction will be signed by the Wallet, returned to the Dapp and the Dapp will send the transaction into the network">
                <Text as="span" fontSize="sm" ml="2">
                  ℹ️
                </Text>
              </Tooltip>
            </Heading>
            <SolanaSendTransactionTest />
          </Box>
          <Box>
            <Heading size="xs" textTransform="uppercase" pb="2">
              Sign and Send Transaction (Wallet)
              <Tooltip label="The transaction will be sent for the Wallet to be signed and sent into the network">
                <Text as="span" fontSize="sm" ml="2">
                  ℹ️
                </Text>
              </Tooltip>
            </Heading>
            <SolanaSignAndSendTransaction />
          </Box>
          {(caipNetwork?.chainId === solanaTestnet.chainId ||
            caipNetwork?.chainId === solanaDevnet.chainId) && (
            <Stack divider={<StackDivider />} spacing="4">
              <Box>
                <Heading size="xs" textTransform="uppercase" pb="2">
                  Counter Program Instruction
                </Heading>
                <SolanaWriteContractTest />
              </Box>
            </Stack>
          )}
        </Stack>
      </CardBody>
    </Card>
  ) : null
}

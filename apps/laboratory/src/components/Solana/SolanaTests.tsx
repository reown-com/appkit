import {
  Box,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Stack,
  StackDivider,
  Text,
  Tooltip
} from '@chakra-ui/react'

import { solana, solanaDevnet, solanaTestnet } from '@reown/appkit/networks'
import { useAppKitAccount, useAppKitNetwork } from '@reown/appkit/react'

import { SolanaSendTransactionTest } from './SolanaSendTransactionTest'
import { SolanaSignAllTransactionsTest } from './SolanaSignAllTransactionsTest'
import { SolanaSignAndSendTransaction } from './SolanaSignAndSendTransactionTest'
import { SolanaSignJupiterSwapTest } from './SolanaSignJupiterSwapTest'
import { SolanaSignMessageTest } from './SolanaSignMessageTest'
import { SolanaSignTransactionTest } from './SolanaSignTransactionTest'
import { SolanaWriteContractTest } from './SolanaWriteContractTest'

export function SolanaTests() {
  const { address } = useAppKitAccount({ namespace: 'solana' })
  const { caipNetwork } = useAppKitNetwork()

  if (!address) {
    return null
  }

  return (
    <Card data-testid="solana-test-interactions" marginTop={10} marginBottom={10}>
      <CardHeader>
        <Heading size="md">Solana Test Interactions</Heading>
      </CardHeader>

      <CardBody>
        <Stack divider={<StackDivider />} spacing="4">
          <Box>
            <Heading size="xs" textTransform="uppercase" pb="2">
              Sign Message
            </Heading>
            <SolanaSignMessageTest />
          </Box>
          {caipNetwork?.id === solana.id && (
            <Box>
              <Text fontSize="md" color="yellow">
                Please be aware that you are connected to the mainnet. Be careful with your
                transactions.
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

          <Box>
            <Heading size="xs" textTransform="uppercase" pb="2">
              Sign Jupiter Swap Transaction
              <Tooltip label="Use Jupiter Swap API to create a transaction that has Address Lookup Tables and requests for the wallet to sign it">
                <Text as="span" fontSize="sm" ml="2">
                  ℹ️
                </Text>
              </Tooltip>
            </Heading>
            <SolanaSignJupiterSwapTest />
          </Box>

          {(caipNetwork?.id === solanaTestnet.id || caipNetwork?.id === solanaDevnet.id) && (
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
  )
}

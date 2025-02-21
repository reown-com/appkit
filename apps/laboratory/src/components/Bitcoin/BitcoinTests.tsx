import * as React from 'react'

import {
  Box,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Stack,
  StackDivider,
  Text
} from '@chakra-ui/react'

import { useAppKitAccount } from '@reown/appkit/react'

import { BitcoinSendTransferTest } from './BitcoinSendTransferTest'
import { BitcoinSignMessageTest } from './BitcoinSignMessageTest'
import { BitcoinSignPSBTTest } from './BitcoinSignPSBTTest'

export function BitcoinTests() {
  const { allAccounts, address } = useAppKitAccount({ namespace: 'bip122' })
  const { isConnected } = useAppKitAccount({ namespace: 'bip122' })

  if (!isConnected) {
    return null
  }

  const bip122Account = allAccounts?.find(a => a.address === address)

  return (
    <Card data-testid="bip122-test-interactions" marginTop={10} marginBottom={10}>
      <CardHeader>
        <Heading size="md">Test Interactions</Heading>
      </CardHeader>

      <CardBody>
        <Stack divider={<StackDivider />} spacing="4">
          <Box>
            <Heading size="xs" textTransform="uppercase" pb="2">
              Public Key
            </Heading>
            <Text data-testid="bip122-public-key">{bip122Account?.publicKey}</Text>
          </Box>
          <Box>
            <Heading size="xs" textTransform="uppercase" pb="2">
              Sign Message Test
            </Heading>
            <BitcoinSignMessageTest />
          </Box>

          <Box>
            <Heading size="xs" textTransform="uppercase" pb="2">
              Sign PSBT Test
            </Heading>
            <BitcoinSignPSBTTest />
          </Box>

          <Box>
            <Heading size="xs" textTransform="uppercase" pb="2">
              Send Transfer Test
            </Heading>
            <BitcoinSendTransferTest />
          </Box>
        </Stack>
      </CardBody>
    </Card>
  )
}

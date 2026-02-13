import * as React from 'react'

import { Box, Card, CardBody, CardHeader, Heading, Stack, StackDivider } from '@chakra-ui/react'

import { useAppKitAccount } from '@reown/appkit/react'

import { TronSendTransactionTest } from './TronSendTransactionTest'
import { TronSignMessageTest } from './TronSignMessageTest'

export function TronTests() {
  const { isConnected } = useAppKitAccount({ namespace: 'tron' })

  if (!isConnected) {
    return null
  }

  return (
    <Card data-testid="tron-test-interactions" marginTop={10} marginBottom={10}>
      <CardHeader>
        <Heading size="md">TRON Test Interactions</Heading>
      </CardHeader>

      <CardBody>
        <Stack divider={<StackDivider />} spacing="4">
          <Box>
            <Heading size="xs" textTransform="uppercase" pb="2">
              Sign Message Test
            </Heading>
            <TronSignMessageTest />
          </Box>
          <Box>
            <Heading size="xs" textTransform="uppercase" pb="2">
              Send Transaction Test
            </Heading>
            <TronSendTransactionTest />
          </Box>
        </Stack>
      </CardBody>
    </Card>
  )
}

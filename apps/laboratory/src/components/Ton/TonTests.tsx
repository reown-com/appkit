import * as React from 'react'

import { Box, Card, CardBody, CardHeader, Heading, Stack, StackDivider } from '@chakra-ui/react'

import { useAppKitAccount } from '@reown/appkit/react'

import { TonSendMessageTest } from './TonSendMessageTest'
import { TonSignDataTest } from './TonSignDataTest'

export function TonTests() {
  const { isConnected } = useAppKitAccount({ namespace: 'ton' })

  if (!isConnected) {
    return null
  }

  return (
    <Card data-testid="ton-test-interactions" marginTop={10} marginBottom={10}>
      <CardHeader>
        <Heading size="md">TON Test Interactions</Heading>
      </CardHeader>

      <CardBody>
        <Stack divider={<StackDivider />} spacing="4">
          <Box>
            <Heading size="xs" textTransform="uppercase" pb="2">
              Sign Data Test
            </Heading>
            <TonSignDataTest />
          </Box>
          <Box>
            <Heading size="xs" textTransform="uppercase" pb="2">
              Send Message Test
            </Heading>
            <TonSendMessageTest />
          </Box>
        </Stack>
      </CardBody>
    </Card>
  )
}

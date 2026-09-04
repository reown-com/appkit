import * as React from 'react'

import { Box, Card, CardBody, CardHeader, Heading, Stack, StackDivider } from '@chakra-ui/react'

import { useAppKitAccount } from '@reown/appkit/react'

import { StellarSignMessageTest } from './StellarSignMessageTest'
import { StellarSignXDRTest } from './StellarSignXDRTest'

export function StellarTests() {
  const { isConnected } = useAppKitAccount({ namespace: 'stellar' })

  if (!isConnected) {
    return null
  }

  return (
    <Card data-testid="stellar-test-interactions" marginTop={10} marginBottom={10}>
      <CardHeader>
        <Heading size="md">Stellar Test Interactions</Heading>
      </CardHeader>

      <CardBody>
        <Stack divider={<StackDivider />} spacing="4">
          <Box>
            <Heading size="xs" textTransform="uppercase" pb="2">
              Sign Message Test
            </Heading>
            <StellarSignMessageTest />
          </Box>
          <Box>
            <Heading size="xs" textTransform="uppercase" pb="2">
              Sign XDR Test
            </Heading>
            <StellarSignXDRTest />
          </Box>
        </Stack>
      </CardBody>
    </Card>
  )
}

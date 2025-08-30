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

import { useAppKitNetwork } from '@reown/appkit/react'

export function AppKitNetworkInfo() {
  const { chainId, caipNetwork } = useAppKitNetwork()

  return (
    <Card>
      <CardHeader>
        <Heading size="md">Network Info</Heading>
      </CardHeader>

      <CardBody>
        <Stack divider={<StackDivider />} spacing="4">
          <Box>
            <Heading size="xs" textTransform="uppercase" pb="2">
              CAIP Network
            </Heading>
            <Text data-testid="w3m-caip-network-name">{caipNetwork?.name || '-'}</Text>
          </Box>
          <Box>
            <Heading size="xs" textTransform="uppercase" pb="2">
              CAIP Network Id
            </Heading>
            <Text data-testid="w3m-caip-network-id">{caipNetwork?.caipNetworkId || '-'}</Text>
          </Box>
          <Box>
            <Heading size="xs" textTransform="uppercase" pb="2">
              Chain Id
            </Heading>
            <Text data-testid="w3m-chain-id">{chainId}</Text>
          </Box>
        </Stack>
      </CardBody>
    </Card>
  )
}

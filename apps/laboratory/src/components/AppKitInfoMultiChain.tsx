import * as React from 'react'

import {
  Box,
  Card,
  CardBody,
  CardHeader,
  Grid,
  Heading,
  Stack,
  StackDivider,
  Text
} from '@chakra-ui/react'

import { type UseAppKitAccountReturn, useAppKitAccount } from '@reown/appkit/react'

function namespaceToTitle(namespace: string | undefined) {
  if (!namespace) {
    return ''
  }

  switch (namespace) {
    case 'eip155':
      return 'EVM'
    case 'solana':
      return 'Solana'
    case 'bip122':
      return 'Bitcoin'
    default:
      return namespace
  }
}

function AccountCard({ account }: { account: UseAppKitAccountReturn | undefined }) {
  if (!account?.caipAddress) {
    return null
  }

  const namespace = account?.caipAddress?.split(':')[0]

  return (
    <Card data-testid={`${namespace}-account-card`}>
      <CardHeader>
        <Heading size="md">{namespaceToTitle(namespace)} Account Info</Heading>
      </CardHeader>

      <CardBody>
        <Stack divider={<StackDivider />} spacing="4">
          <Box>
            <Heading size="xs" textTransform="uppercase" pb="2">
              CAIP Address
            </Heading>
            <Text data-testid="w3m-caip-address">{account.caipAddress}</Text>
          </Box>

          <Box>
            <Heading size="xs" textTransform="uppercase" pb="2">
              Status
            </Heading>
            <Text data-testid="w3m-address">{account.status}</Text>
          </Box>
        </Stack>
      </CardBody>
    </Card>
  )
}

export function AppKitInfoMultiChain() {
  const evmAccount = useAppKitAccount({ namespace: 'eip155' })
  const solanaAccount = useAppKitAccount({ namespace: 'solana' })
  const bitcoinAccount = useAppKitAccount({ namespace: 'bip122' })

  return (
    <Grid
      templateColumns={{ base: 'repeat(1, 1fr)', md: 'repeat(3, 1fr)' }}
      gap={4}
      marginTop={4}
      marginBottom={4}
    >
      <AccountCard account={evmAccount} />
      <AccountCard account={solanaAccount} />
      <AccountCard account={bitcoinAccount} />
    </Grid>
  )
}

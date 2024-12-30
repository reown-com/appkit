import * as React from 'react'
import {
  StackDivider,
  Card,
  CardHeader,
  Heading,
  CardBody,
  Box,
  Stack,
  Text
} from '@chakra-ui/react'
import type { useAppKitAccount } from '@reown/appkit/react'

type AppKitInfoProps = {
  caipAddress?: string
  address?: string
  chainId?: number | string
  clientId?: string
  user: ReturnType<typeof useAppKitAccount>['user']
}

export function AppKitInfo({ caipAddress, address, chainId, clientId, user }: AppKitInfoProps) {
  const { accountType, email, username, isSmartAccountDeployed } = user

  return (
    <Card marginTop={10} marginBottom={10}>
      <CardHeader>
        <Heading size="md">Account Information</Heading>
      </CardHeader>

      <CardBody>
        <Stack divider={<StackDivider />} spacing="4">
          <Box>
            <Heading size="xs" textTransform="uppercase" pb="2">
              CAIP Address
            </Heading>
            <Text data-testid="w3m-caip-address">{caipAddress}</Text>
          </Box>

          <Box>
            <Heading size="xs" textTransform="uppercase" pb="2">
              Address
            </Heading>
            <Text data-testid="w3m-address">{address}</Text>
          </Box>

          <Box>
            <Heading size="xs" textTransform="uppercase" pb="2">
              Chain Id
            </Heading>
            <Text data-testid="w3m-chain-id">{chainId}</Text>
          </Box>

          {clientId && (
            <Box>
              <Heading size="xs" textTransform="uppercase" pb="2">
                Relay Client ID
              </Heading>
              <Text data-testid="w3m-chain-id">{clientId}</Text>
            </Box>
          )}

          {accountType && (
            <Box>
              <Heading size="xs" textTransform="uppercase" pb="2">
                Account Type
              </Heading>
              <Text data-testid="w3m-auth-account-type">
                {accountType === 'eoa' ? 'EOA' : 'Smart Account'}
              </Text>
            </Box>
          )}

          {email && (
            <Box>
              <Heading size="xs" textTransform="uppercase" pb="2">
                Email
              </Heading>
              <Text data-testid="w3m-email">{email}</Text>
            </Box>
          )}

          {username && (
            <Box>
              <Heading size="xs" textTransform="uppercase" pb="2">
                Username
              </Heading>
              <Text>{username}</Text>
            </Box>
          )}

          {accountType && (
            <Box>
              <Heading size="xs" textTransform="uppercase" pb="2">
                Smart Account Status
              </Heading>
              <Text data-testid="w3m-sa-account-status">
                {isSmartAccountDeployed ? 'Deployed' : 'Not Deployed'}
              </Text>
            </Box>
          )}
        </Stack>
      </CardBody>
    </Card>
  )
}

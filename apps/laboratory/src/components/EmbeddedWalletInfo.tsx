import { Box, Heading, Stack, StackDivider, Text } from '@chakra-ui/react'

import { useAppKitAccount } from '@reown/appkit/react'

export function EmbeddedWalletInfo() {
  const { embeddedWalletInfo } = useAppKitAccount()

  const { accountType, user, isSmartAccountDeployed } = embeddedWalletInfo ?? {}

  const email = user?.email
  const username = user?.username

  if (!embeddedWalletInfo) {
    return null
  }

  return (
    <Stack divider={<StackDivider />} spacing="4">
      <Box>
        <Heading size="xs" textTransform="uppercase" pb="2">
          Account Type
        </Heading>
        <Text data-testid="w3m-account-type">
          {accountType === 'eoa' ? 'EOA' : 'Smart Account'}
        </Text>
      </Box>

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

      <Box>
        <Heading size="xs" textTransform="uppercase" pb="2">
          Smart Account Status
        </Heading>
        <Text data-testid="w3m-sa-account-status">
          {isSmartAccountDeployed ? 'Deployed' : 'Not Deployed'}
        </Text>
      </Box>
    </Stack>
  )
}

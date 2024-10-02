import * as React from 'react'
import { StackDivider, Heading, Box, Stack, Text } from '@chakra-ui/react'
import { getChain } from '../utils/NetworksUtil'
import { formatDistanceToNow } from 'date-fns'
import type { SmartSessionGrantPermissionsResponse } from '@reown/appkit-experimental/smart-session'

export function SmartSessionGrantedPermissionsInfo({
  grantedPermissions
}: {
  grantedPermissions: SmartSessionGrantPermissionsResponse | undefined
}) {
  if (!grantedPermissions?.context) {
    return (
      <Text fontSize="md" color="yellow">
        Dapp does not have any stored permissions
      </Text>
    )
  }

  const { address, chainId, expiry } = grantedPermissions
  const parsedExpiry = formatDistanceToNow(new Date(expiry * 1000), { addSuffix: true })
  const parsedChainId = parseInt(chainId, 16)
  const chain = getChain(parsedChainId)

  return (
    <Stack direction={['column', 'column', 'row']} divider={<StackDivider />} spacing="4">
      <Box>
        <Heading size="xs" textTransform="uppercase" pb="2">
          Account Address
        </Heading>
        <Text>{address}</Text>
      </Box>
      <Box>
        <Heading size="xs" textTransform="uppercase" pb="2">
          Chain Id
        </Heading>
        <Text>{chain?.name || chainId}</Text>
      </Box>
      <Box>
        <Heading size="xs" textTransform="uppercase" pb="2">
          Expiry
        </Heading>
        <Text>{parsedExpiry}</Text>
      </Box>
    </Stack>
  )
}

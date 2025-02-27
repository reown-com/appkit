import { Box, Card, CardBody, CardHeader, Heading, Stack, StackDivider } from '@chakra-ui/react'

import { SmartSessionGrantedPermissionsInfo } from '@/src/components/SmartSessionGrantedPermissionsInfo'
import { WagmiCreatePasskeySignerTest } from '@/src/components/Wagmi/WagmiCreatePasskeySignerTest'
import { WagmiPurchaseDonutSyncPermissionsTest } from '@/src/components/Wagmi/WagmiPurchaseDonutSyncPermissionsTest'
import { WagmiRequestPermissionsSyncTest } from '@/src/components/Wagmi/WagmiRequestPermissionsSyncTest'
import { useERC7715Permissions } from '@/src/hooks/useERC7715Permissions'

export function WagmiPermissionsSyncTest() {
  const { smartSession } = useERC7715Permissions()
  const grantedPermissions =
    smartSession?.type === 'sync' ? smartSession.grantedPermissions : undefined

  return (
    <Card data-testid="eip155-test-interactions" marginTop={10} marginBottom={10}>
      <CardHeader>
        <Heading size="md">Wagmi Test Interactions</Heading>
      </CardHeader>
      <CardBody>
        <Stack divider={<StackDivider />} spacing="4">
          <Box>
            <Heading size="xs" textTransform="uppercase" pb="2">
              Existing Session Information
            </Heading>
            <SmartSessionGrantedPermissionsInfo grantedPermissions={grantedPermissions} />
          </Box>
          <Box>
            <Heading size="xs" textTransform="uppercase" pb="2">
              New Passkey
            </Heading>
            <WagmiCreatePasskeySignerTest />
          </Box>
          <Box>
            <Heading size="xs" textTransform="uppercase" pb="2">
              Request Permissions
            </Heading>
            <WagmiRequestPermissionsSyncTest />
          </Box>
          <Box>
            <Heading size="xs" textTransform="uppercase" pb="2">
              Purchase Donut With Permissions
            </Heading>
            <WagmiPurchaseDonutSyncPermissionsTest />
          </Box>
        </Stack>
      </CardBody>
    </Card>
  )
}

import { Box, Card, CardBody, CardHeader, Heading, Stack, StackDivider } from '@chakra-ui/react'

import { SmartSessionGrantedPermissionsInfo } from '@/src/components/SmartSessionGrantedPermissionsInfo'
import { WagmiPurchaseDonutAsyncPermissionsTest } from '@/src/components/Wagmi/WagmiPurchaseDonutAsyncPermissionsTest'
import { WagmiRequestPermissionsAsyncTest } from '@/src/components/Wagmi/WagmiRequestPermissionsAsyncTest'
import { useERC7715Permissions } from '@/src/hooks/useERC7715Permissions'

export function WagmiPermissionsAsyncTest() {
  const { smartSession } = useERC7715Permissions()
  const grantedPermissions =
    smartSession?.type === 'async' ? smartSession.grantedPermissions : undefined

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
              Request Permissions
            </Heading>
            <WagmiRequestPermissionsAsyncTest />
          </Box>
          <Box>
            <Heading size="xs" textTransform="uppercase" pb="2">
              Purchase Donut With Permissions
            </Heading>
            <WagmiPurchaseDonutAsyncPermissionsTest />
          </Box>
        </Stack>
      </CardBody>
    </Card>
  )
}

import { Box, Card, CardBody, CardHeader, Heading, Stack, StackDivider } from '@chakra-ui/react'
import { WagmiRequestPermissionsSyncTest } from './WagmiRequestPermissionsSyncTest'
import { WagmiPurchaseDonutSyncPermissionsTest } from './WagmiPurchaseDonutSyncPermissionsTest'
import { WagmiCreatePasskeySignerTest } from './WagmiCreatePasskeySignerTest'

export function WagmiPermissionsSyncTest() {
  return (
    <Card marginTop={10} marginBottom={10}>
      <CardHeader>
        <Heading size="md">Test Interactions</Heading>
      </CardHeader>
      <CardBody>
        <Stack divider={<StackDivider />} spacing="4">
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

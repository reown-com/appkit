import { Box, Card, CardBody, CardHeader, Heading, Stack, StackDivider } from '@chakra-ui/react'
import { WagmiRequestPermissionsAsyncTest } from './WagmiRequestPermissionsAsyncTest'
import { WagmiPurchaseDonutAsyncPermissionsTest } from './WagmiPurchaseDonutAsyncPermissionsTest'

export function WagmiPermissionsAsyncTest() {
  return (
    <Card marginTop={10} marginBottom={10}>
      <CardHeader>
        <Heading size="md">Test Interactions</Heading>
      </CardHeader>
      <CardBody>
        <Stack divider={<StackDivider />} spacing="4">
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

import { Stack, Card, CardHeader, Heading, CardBody, Box, StackDivider } from '@chakra-ui/react'
import { AppKitHooks } from './AppKitHooks'
import { useAppKit, useAppKitAccount } from '@reown/appkit/react'

function CustomButton() {
  const { open } = useAppKit()
  const { status, address, caipAddress } = useAppKitAccount()

  const isPending = status === undefined || status === 'connecting' || status === 'reconnecting'

  if (isPending) {
    return <div>Loading</div>
  }

  return (
    <div style={{ padding: 16, background: 'gray', color: 'red' }} onClick={() => open()}>
      {caipAddress} {address}
    </div>
  )
}

export function AppKitButtons() {
  return (
    <Card marginTop={10}>
      <CardHeader>
        <Heading size="md">AppKit Interactions</Heading>
      </CardHeader>

      <CardBody>
        <Stack divider={<StackDivider />} spacing="4" flexWrap="wrap">
          <Box>
            <Heading size="xs" textTransform="uppercase" pb="2">
              Connect / Account Button
            </Heading>
            <CustomButton />
            <appkit-button />
          </Box>
          <Box>
            <Heading size="xs" textTransform="uppercase" pb="2">
              Network Button
            </Heading>
            <appkit-network-button />
          </Box>
          <AppKitHooks />
        </Stack>
      </CardBody>
    </Card>
  )
}

import { useAppKit, useDisconnect, useAppKitAccount } from '@reown/appkit/react'
import {
  Stack,
  Card,
  CardHeader,
  Heading,
  CardBody,
  Box,
  StackDivider,
  Button
} from '@chakra-ui/react'

export function AppKitButtons() {
  const { open } = useAppKit()
  const { caipAddress } = useAppKitAccount()
  const { disconnect } = useDisconnect()

  return (
    <Card marginTop={10}>
      <CardHeader>
        <Heading size="md">AppKit Interactions</Heading>
      </CardHeader>

      <CardBody>
        <Stack divider={<StackDivider />} spacing="4">
          <Box>
            <Heading size="xs" textTransform="uppercase" pb="2">
              Connect / Account Button
            </Heading>
            <w3m-button />
          </Box>
          <Box>
            <Heading size="xs" textTransform="uppercase" pb="2">
              Network Button
            </Heading>
            <w3m-network-button />
          </Box>
          <Box>
            <Heading size="xs" textTransform="uppercase" pb="2">
              Hooks Interactions
            </Heading>
            <Box display="flex" alignItems="center" columnGap={3}>
              <Button data-testid="w3m-open-hook-button" onClick={() => open()}>
                Open
              </Button>

              {caipAddress && (
                <Button data-testid="disconnect-hook-button" onClick={() => disconnect()}>
                  Disconnect
                </Button>
              )}
            </Box>
          </Box>
        </Stack>
      </CardBody>
    </Card>
  )
}

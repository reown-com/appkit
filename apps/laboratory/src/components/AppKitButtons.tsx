import { useAppKit, useDisconnect, useAppKitAccount, useAppKitNetwork } from '@reown/appkit/react'
import { polygon, mainnet, solana, solanaTestnet, type AppKitNetwork } from '@reown/appkit/networks'
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
  const { isConnected } = useAppKitAccount()
  const { caipNetwork, switchNetwork } = useAppKitNetwork()
  const { disconnect } = useDisconnect()

  const isEIPNamespace = caipNetwork?.chainNamespace === 'eip155'
  // eslint-disable-next-line no-nested-ternary
  const networkToSwitch: AppKitNetwork = isEIPNamespace
    ? caipNetwork?.id === polygon.id
      ? mainnet
      : polygon
    : caipNetwork?.id === solana.id
      ? solanaTestnet
      : solana

  function handleSwitchNetwork() {
    if (isEIPNamespace) {
      switchNetwork(networkToSwitch)
    } else {
      switchNetwork(networkToSwitch)
    }
  }

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

              <Button
                data-testid="disconnect-hook-button"
                isDisabled={!isConnected}
                onClick={() => disconnect()}
              >
                Disconnect
              </Button>

              {caipNetwork ? (
                <Button data-testid="switch-network-hook-button" onClick={handleSwitchNetwork}>
                  Switch Network to {networkToSwitch?.name}
                </Button>
              ) : null}
            </Box>
          </Box>
        </Stack>
      </CardBody>
    </Card>
  )
}

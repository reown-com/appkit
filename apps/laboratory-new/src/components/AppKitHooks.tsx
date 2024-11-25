import {
  useAppKit,
  useDisconnect,
  useAppKitAccount,
  useAppKitNetwork
} from '@reown/appkit-new/react'
import {
  polygon,
  mainnet,
  solana,
  solanaTestnet,
  type AppKitNetwork
} from '@reown/appkit-new/networks'
import { Heading, Box, Button } from '@chakra-ui/react'

export function AppKitHooks() {
  const { open } = useAppKit()
  const { isConnected } = useAppKitAccount()
  const { caipNetwork, switchNetwork } = useAppKitNetwork()
  const { disconnect } = useDisconnect()

  function handleSwitchNetwork() {
    const isEIPNamespace = caipNetwork?.chainNamespace === 'eip155'
    // eslint-disable-next-line no-nested-ternary
    const networkToSwitch: AppKitNetwork = isEIPNamespace
      ? caipNetwork?.id === polygon.id
        ? mainnet
        : polygon
      : caipNetwork?.id === solana.id
        ? solanaTestnet
        : solana

    switchNetwork(networkToSwitch)
  }

  return (
    <Box>
      <Heading size="xs" textTransform="uppercase" pb="2">
        Hooks Interactions
      </Heading>
      <Box display="flex" alignItems="center" columnGap={3} flexWrap="wrap">
        <Button data-testid="w3m-open-hook-button" onClick={() => open()}>
          Open
        </Button>

        {isConnected && (
          <Button data-testid="disconnect-hook-button" onClick={disconnect}>
            Disconnect
          </Button>
        )}

        <Button data-testid="switch-network-hook-button" onClick={handleSwitchNetwork}>
          Switch Network
        </Button>
      </Box>
    </Box>
  )
}

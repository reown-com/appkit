import { Box, Button, Heading } from '@chakra-ui/react'

import {
  bitcoin,
  bitcoinTestnet,
  mainnet,
  polygon,
  solana,
  solanaTestnet
} from '@reown/appkit/networks'
import {
  type CaipNetwork,
  useAppKit,
  useAppKitAccount,
  useAppKitNetwork,
  useDisconnect
} from '@reown/appkit/react'

function getNetworkToSwitch(activeNetwork: CaipNetwork | undefined) {
  if (!activeNetwork) {
    return mainnet
  }

  switch (activeNetwork.chainNamespace) {
    case 'bip122':
      return activeNetwork.id === bitcoin.id ? bitcoinTestnet : bitcoin
    case 'solana':
      return activeNetwork.id === solana.id ? solanaTestnet : solana
    default:
      return activeNetwork.id === polygon.id ? mainnet : polygon
  }
}

export function AppKitHooks() {
  const { open } = useAppKit()
  const { isConnected } = useAppKitAccount()
  const { caipNetwork, switchNetwork } = useAppKitNetwork()
  const { disconnect } = useDisconnect()

  function handleSwitchNetwork() {
    const networkToSwitch = getNetworkToSwitch(caipNetwork)

    if (!networkToSwitch) {
      return
    }

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

        <Button data-testid="w3m-connect-hook-button" onClick={() => open({ view: 'Connect' })}>
          Connect
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

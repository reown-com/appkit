import { Box, Button, Heading, Select, Text } from '@chakra-ui/react'

import {
  type AppKitNetwork,
  bitcoin,
  bitcoinTestnet,
  mainnet,
  polygon,
  solana,
  solanaTestnet
} from '@reown/appkit/networks'
import {
  useAppKit,
  useAppKitAccount,
  useAppKitNetwork,
  useDisconnect
} from '@reown/appkit/react-core'

export interface AppKitCoreHooksProps {
  networks?: AppKitNetwork[]
}

export function AppKitCoreHooks({ networks }: AppKitCoreHooksProps) {
  const { open } = useAppKit()
  const { caipNetwork, switchNetwork } = useAppKitNetwork()
  const { caipAddress } = useAppKitAccount()
  const { disconnect } = useDisconnect()

  // Default networks if none provided
  const availableNetworks = networks || [
    mainnet,
    polygon,
    solana,
    solanaTestnet,
    bitcoin,
    bitcoinTestnet
  ]

  function handleNetworkChange(event: React.ChangeEvent<HTMLSelectElement>) {
    const networkId = event.target.value

    const networkToSwitch = availableNetworks.find(network => String(network.id) === networkId)
    if (networkToSwitch) {
      switchNetwork(networkToSwitch)
    }
  }

  return (
    <Box>
      <Heading size="xs" textTransform="uppercase" pb="2">
        Hooks Interactions
      </Heading>
      <Box display="flex" alignItems="center" columnGap={3} flexWrap="wrap" mb={4}>
        {caipAddress ? (
          <Button data-testid="disconnect-hook-button" onClick={disconnect}>
            Disconnect
          </Button>
        ) : (
          <Button data-testid="w3m-open-hook-button" onClick={() => open()}>
            Open
          </Button>
        )}
      </Box>

      <Box mb={4}>
        <Text fontSize="sm" mb={2}>
          Current Network: {caipNetwork?.name || 'None'}
        </Text>
        <Box position="relative">
          <Select
            value={caipNetwork?.id}
            onChange={handleNetworkChange}
            placeholder="Select Network"
            data-testid="network-selector"
            borderRadius="full"
            width="200px"
            iconColor="gray.500"
          >
            {availableNetworks.map(network => (
              <option key={network.id} value={network.id} disabled={network.id === caipNetwork?.id}>
                {network.name}
              </option>
            ))}
          </Select>
        </Box>
      </Box>
    </Box>
  )
}

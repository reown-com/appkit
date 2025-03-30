import { Box, Button, Heading } from '@chakra-ui/react'
import { usePathname } from 'next/navigation'

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
  const pathname = usePathname()
  const isMultichainPage = pathname?.includes('multichain-no-adapters')

  function handleSwitchNetwork() {
    if (isMultichainPage) {
      switchNetwork(getNetworkToSwitch(caipNetwork))
      
      return
    }

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

        {isConnected && (
          <Button data-testid="disconnect-hook-button" onClick={() => disconnect()}>
            Disconnect
          </Button>
        )}

        <Button data-testid="switch-network-hook-button" onClick={handleSwitchNetwork}>
          {isMultichainPage ? 'Switch to EVM' : 'Switch Network'}
        </Button>

        {isMultichainPage && (
          <>
            <Button onClick={() => switchNetwork(solana)}>Switch to Solana</Button>
            <Button onClick={() => switchNetwork(bitcoin)}>Switch to Bitcoin</Button>
          </>
        )}
      </Box>
    </Box>
  )
}

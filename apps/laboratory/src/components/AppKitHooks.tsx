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

import { ConstantsUtil } from '../utils/ConstantsUtil'
import { useChakraToast } from './Toast'

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
  const { open, openSend } = useAppKit()
  const { isConnected, address } = useAppKitAccount()
  const { caipNetwork, switchNetwork } = useAppKitNetwork()
  const { disconnect } = useDisconnect()
  const toast = useChakraToast()
  const pathname = usePathname()
  const isMultichainPage = pathname?.includes('multichain-no-adapters')

  function handleSwitchNetwork() {
    const networkToSwitch = getNetworkToSwitch(caipNetwork)

    if (!networkToSwitch) {
      return
    }

    switchNetwork(networkToSwitch)
  }

  function handleOpenSwapWithArguments() {
    open({
      view: 'Swap',
      arguments: {
        amount: '321.123',
        fromToken: 'USDC',
        toToken: 'ETH'
      }
    })
  }

  const USDC_ADDRESS = '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913'
  async function handleOpenSendWithArguments() {
    if (address) {
      const { hash } = await openSend({
        amount: '1',
        assetAddress: USDC_ADDRESS,
        namespace: 'eip155',
        chainId: 8453,
        to: address
      })

      toast({
        title: ConstantsUtil.SigningSucceededToastTitle,
        description: hash,
        type: 'success'
      })
    }
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

        {!isMultichainPage && (
          <Button data-testid="switch-network-hook-button" onClick={handleSwitchNetwork}>
            Switch Network
          </Button>
        )}

        {isMultichainPage && (
          <>
            <Button onClick={() => switchNetwork(mainnet)}>Switch to Ethereum</Button>
            <Button onClick={() => switchNetwork(polygon)}>Switch to Polygon</Button>
            <Button onClick={() => switchNetwork(solana)}>Switch to Solana</Button>
            <Button onClick={() => switchNetwork(bitcoin)}>Switch to Bitcoin</Button>
          </>
        )}

        <Button
          data-testid="open-swap-with-arguments-hook-button"
          onClick={handleOpenSwapWithArguments}
        >
          Open Swap with Arguments
        </Button>

        <Button
          data-testid="open-send-with-arguments-hook-button"
          onClick={handleOpenSendWithArguments}
        >
          Open Send with Arguments
        </Button>
      </Box>
    </Box>
  )
}

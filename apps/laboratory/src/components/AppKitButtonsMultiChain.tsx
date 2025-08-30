import {
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Stack,
  StackDivider,
  Text
} from '@chakra-ui/react'

import {
  bitcoin,
  bitcoinTestnet,
  mainnet,
  polygon,
  solana,
  solanaTestnet
} from '@reown/appkit/networks'
import {
  AppKitButton,
  AppKitNetworkButton,
  type CaipNetwork,
  useAppKit,
  useAppKitAccount,
  useAppKitNetwork,
  useDisconnect
} from '@reown/appkit/react'

import type { Adapter } from '../constants/appKitConfigs'

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

export function AppKitButtonsMultiChain({ adapters }: { adapters: Adapter[] | undefined }) {
  const { open } = useAppKit()
  const { disconnect } = useDisconnect()
  const { caipNetwork, switchNetwork } = useAppKitNetwork()
  const evmAccount = useAppKitAccount({ namespace: 'eip155' })
  const solanaAccount = useAppKitAccount({ namespace: 'solana' })
  const bitcoinAccount = useAppKitAccount({ namespace: 'bip122' })
  const isAnyAccountConnected =
    evmAccount.isConnected || solanaAccount.isConnected || bitcoinAccount.isConnected

  function handleConnectToEVM() {
    open({ namespace: 'eip155' })
  }

  function handleConnectToSolana() {
    open({ namespace: 'solana' })
  }

  function handleConnectToBitcoin() {
    open({ namespace: 'bip122' })
  }

  const hasEvmAdapter =
    adapters?.includes('wagmi') || adapters?.includes('ethers') || adapters?.includes('ethers5')
  const hasSolanaAdapter = adapters?.includes('solana')
  const hasBitcoinAdapter = adapters?.includes('bitcoin')
  const isMultipleAdapter = adapters?.length && adapters.length > 1

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

  function handleSwitchNetwork() {
    const networkToSwitch = getNetworkToSwitch(caipNetwork)

    if (!networkToSwitch) {
      return
    }

    switchNetwork(networkToSwitch)
  }

  return (
    <Card marginTop={10}>
      <CardHeader>
        <Heading size="md">AppKit Interactions</Heading>
      </CardHeader>

      <CardBody>
        <Stack divider={<StackDivider />} spacing="4" flexWrap="wrap">
          <Box>
            <Stack spacing="2" alignItems="left" flexWrap="wrap">
              <Stack pb="2">
                <Text fontWeight="bold" fontSize="sm" textTransform="uppercase">
                  Default Button
                </Text>
                <AppKitButton />
              </Stack>
              {isMultipleAdapter ? (
                <>
                  {hasEvmAdapter ? (
                    <>
                      <Stack pb="2">
                        <Text fontWeight="bold" fontSize="sm" textTransform="uppercase">
                          EVM Button
                        </Text>
                        <AppKitButton namespace="eip155" />
                      </Stack>
                    </>
                  ) : null}
                  {hasBitcoinAdapter ? (
                    <>
                      <Stack pb="2">
                        <Text fontWeight="bold" fontSize="sm" textTransform="uppercase">
                          Bitcoin Button
                        </Text>
                        <AppKitButton namespace="bip122" />
                      </Stack>
                    </>
                  ) : null}
                  {hasSolanaAdapter ? (
                    <>
                      <Stack pb="2">
                        <Text fontWeight="bold" fontSize="sm" textTransform="uppercase">
                          Solana Button
                        </Text>
                        <AppKitButton namespace="solana" />
                      </Stack>
                    </>
                  ) : null}
                </>
              ) : null}
            </Stack>
          </Box>
          <Box>
            <Heading size="xs" textTransform="uppercase" pb="2">
              Network Button
            </Heading>
            <AppKitNetworkButton />
          </Box>

          <Box>
            <Heading size="xs" textTransform="uppercase" pb="2">
              Hooks Interactions
            </Heading>
            <Box display="flex" alignItems="center" gap={4} flexWrap="wrap">
              <Box>
                <Heading size="xs" textTransform="uppercase" pb="2" color="gray.500">
                  Open
                </Heading>
                <Box display="flex" alignItems="center" gap={4} flexWrap="wrap">
                  <Button data-testid="w3m-open-hook-button" onClick={() => open()}>
                    Open
                  </Button>
                  <Button data-testid="evm-connect-button" onClick={handleConnectToEVM}>
                    Open EVM Modal
                  </Button>
                  <Button data-testid="solana-connect-button" onClick={handleConnectToSolana}>
                    Open Solana Modal
                  </Button>
                  <Button data-testid="bitcoin-connect-button" onClick={handleConnectToBitcoin}>
                    Open Bitcoin Modal
                  </Button>
                  {isMultipleAdapter ? null : (
                    <Button data-testid="switch-network-hook-button" onClick={handleSwitchNetwork}>
                      Switch Network
                    </Button>
                  )}
                  <Button
                    data-testid="open-swap-with-arguments-hook-button"
                    onClick={handleOpenSwapWithArguments}
                  >
                    Open Swap with Arguments
                  </Button>
                </Box>
              </Box>

              <Box>
                <Heading size="xs" textTransform="uppercase" pb="2" color="gray.500">
                  Disconnect
                </Heading>
                <Box display="flex" alignItems="center" gap={4} flexWrap="wrap">
                  <Button
                    isDisabled={!isAnyAccountConnected}
                    data-testid="disconnect-hook-button"
                    onClick={() => disconnect()}
                  >
                    Disconnect All
                  </Button>
                  <Button
                    isDisabled={!evmAccount.isConnected}
                    data-testid="eip155-disconnect-button"
                    onClick={() => disconnect({ namespace: 'eip155' })}
                  >
                    Disconnect EVM
                  </Button>
                  <Button
                    isDisabled={!solanaAccount.isConnected}
                    data-testid="solana-disconnect-button"
                    onClick={() => disconnect({ namespace: 'solana' })}
                  >
                    Disconnect Solana
                  </Button>
                  <Button
                    isDisabled={!bitcoinAccount.isConnected}
                    data-testid="bip122-disconnect-button"
                    onClick={() => disconnect({ namespace: 'bip122' })}
                  >
                    Disconnect Bitcoin
                  </Button>
                </Box>
              </Box>
            </Box>
          </Box>
        </Stack>
      </CardBody>
    </Card>
  )
}

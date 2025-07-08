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

import { useAppKit, useAppKitAccount, useDisconnect } from '@reown/appkit/react'

export function AppKitButtonsMultiChain() {
  const { open } = useAppKit()
  const { disconnect } = useDisconnect()
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
                <appkit-button />
              </Stack>
              <Stack pb="2">
                <Text fontWeight="bold" fontSize="sm" textTransform="uppercase">
                  EVM Button
                </Text>
                <appkit-button namespace="eip155" />
              </Stack>
              <Stack pb="2">
                <Text fontWeight="bold" fontSize="sm" textTransform="uppercase">
                  Bitcoin Button
                </Text>
                <appkit-button namespace="bip122" />
              </Stack>
              <Stack pb="2">
                <Text fontWeight="bold" fontSize="sm" textTransform="uppercase">
                  Solana Button
                </Text>
                <appkit-button namespace="solana" />
              </Stack>
            </Stack>
          </Box>
          <Box>
            <Heading size="xs" textTransform="uppercase" pb="2">
              Network Button
            </Heading>
            <appkit-network-button />
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

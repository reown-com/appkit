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
  const { isConnected } = useAppKitAccount()
  const { disconnect } = useDisconnect()
  const evmAccount = useAppKitAccount({ namespace: 'eip155' })
  const solanaAccount = useAppKitAccount({ namespace: 'solana' })
  const bitcoinAccount = useAppKitAccount({ namespace: 'bip122' })

  function handleConnectToEVM() {
    open({ view: 'Connect', namespace: 'eip155' })
  }

  function handleConnectToSolana() {
    open({ view: 'Connect', namespace: 'solana' })
  }

  function handleConnectToBitcoin() {
    open({ view: 'Connect', namespace: 'bip122' })
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
            <Box display="flex" alignItems="center" columnGap={3} flexWrap="wrap">
              <Button data-testid="w3m-open-hook-button" onClick={() => open()}>
                Open
              </Button>

              {isConnected ? (
                <Button data-testid="disconnect-hook-button" onClick={disconnect}>
                  Disconnect
                </Button>
              ) : null}

              {!evmAccount.address && (
                <Button data-testid="evm-connect-button" onClick={handleConnectToEVM}>
                  Connect to EVM
                </Button>
              )}

              {!solanaAccount.address && (
                <Button data-testid="solana-connect-button" onClick={handleConnectToSolana}>
                  Connect to Solana
                </Button>
              )}

              {!bitcoinAccount.address && (
                <Button data-testid="bitcoin-connect-button" onClick={handleConnectToBitcoin}>
                  Connect to Bitcoin
                </Button>
              )}
            </Box>
          </Box>
        </Stack>
      </CardBody>
    </Card>
  )
}

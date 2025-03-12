import { Box, Card, CardBody, CardHeader, Heading, Stack, StackDivider, Text } from '@chakra-ui/react'
import type { Config } from 'wagmi'

import { useAppKitAccount } from '@reown/appkit/react'

import { WagmiDisconnectTest } from './WagmiDisconnectTest'
import { WagmiWalletCheckoutTest } from './WagmiWalletCheckoutTest'

interface IProps {
  config?: Config
}

export function WagmiCheckoutTests({ config }: IProps) {
  const { address, status } = useAppKitAccount({ namespace: 'eip155' })

  if (!address || status !== 'connected') {
    return (
      <Card>
        <CardHeader>
          <Heading size="md">Wagmi Checkout Interactions</Heading>
        </CardHeader>
        <CardBody>
          <Text>Please connect your wallet to continue</Text>
        </CardBody>
      </Card>
    )
  }

  return (
    <Card data-testid="eip155-test-interactions" marginTop={10} marginBottom={10}>
      <CardHeader>
        <Heading size="md">Wagmi Checkout Interactions</Heading>
      </CardHeader>
      <CardBody>
        <Stack divider={<StackDivider />} spacing="4">
          <Box>
            <Heading size="xs" textTransform="uppercase" pb="2">
              Wallet Checkout
            </Heading>
            <WagmiWalletCheckoutTest config={config} />
          </Box>

          <Box>
            <Heading size="xs" textTransform="uppercase" pb="2">
              Disconnect
            </Heading>
            <WagmiDisconnectTest />
          </Box>
        </Stack>
      </CardBody>
    </Card>
  )
}

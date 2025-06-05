import { Box, Card, CardBody, CardHeader, Heading, Stack, StackDivider } from '@chakra-ui/react'
import { type MobileWallet, transact } from '@solana-mobile/mobile-wallet-adapter-protocol'

import { useProjectId } from '../hooks/useProjectId'
import { AppKitHooks } from './AppKitHooks'

export function AppKitButtons() {
  const { projectId } = useProjectId()

  async function connectMobileSolana() {
    // eslint-disable-next-line no-console
    await transact(async (wallet: MobileWallet) => {
      const authResult = await wallet.authorize({
        chain: 'solana:mainnet',
        identity: {
          name: 'AppKit Lab',
          uri: 'https://yourdapp.com',
          icon: 'favicon.ico'
        }
      })

      // eslint-disable-next-line no-console
      console.log(authResult)
    })
  }

  return (
    <Card marginTop={10}>
      <CardHeader>
        {projectId && (
          <Box>
            <Heading size="xs" color="orange" pb="2">
              Using Injected Project ID: {projectId}
            </Heading>
          </Box>
        )}
        <Heading size="md">AppKit Interactions</Heading>
      </CardHeader>

      <CardBody>
        <Stack divider={<StackDivider />} spacing="4" flexWrap="wrap">
          <Box>
            <Heading size="xs" textTransform="uppercase" pb="2">
              Connect / Account Button
            </Heading>
            <appkit-button />
          </Box>
          <Box>
            <Heading size="xs" textTransform="uppercase" pb="2">
              Solana Mobile Wallet Adapter
            </Heading>
            <button onClick={connectMobileSolana}>Connect</button>
          </Box>
          <Box>
            <Heading size="xs" textTransform="uppercase" pb="2">
              Network Button
            </Heading>
            <appkit-network-button />
          </Box>
          <AppKitHooks />
        </Stack>
      </CardBody>
    </Card>
  )
}

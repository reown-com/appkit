import { Box, Card, CardBody, CardHeader, Heading, Stack, StackDivider } from '@chakra-ui/react'
import { transact } from '@solana-mobile/mobile-wallet-adapter-protocol'

import { useProjectId } from '../hooks/useProjectId'
import { AppKitHooks } from './AppKitHooks'

export function AppKitButtons() {
  const { projectId } = useProjectId()

  function connectMobileSolana() {
    transact(wallet => console.log(wallet))
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

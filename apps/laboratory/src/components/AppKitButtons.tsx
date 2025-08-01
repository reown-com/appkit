import { Box, Card, CardBody, CardHeader, Heading, Stack, StackDivider } from '@chakra-ui/react'

import { AppKitButton, AppKitNetworkButton } from '@reown/appkit/react'

import { useProjectId } from '../hooks/useProjectId'
import { AppKitHooks } from './AppKitHooks'

export function AppKitButtons() {
  const { projectId } = useProjectId()

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
            <AppKitButton />
          </Box>
          <Box>
            <Heading size="xs" textTransform="uppercase" pb="2">
              Network Button
            </Heading>
            <AppKitNetworkButton />
          </Box>
          <Box>
            <Heading size="xs" textTransform="uppercase" pb="2">
              Solana Wallet Standard Button
            </Heading>
          </Box>
          <AppKitHooks />
        </Stack>
      </CardBody>
    </Card>
  )
}

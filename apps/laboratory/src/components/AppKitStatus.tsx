import { Stack, Card, CardHeader, Heading, CardBody, Box, StackDivider } from '@chakra-ui/react'
import { useAppKitState } from '@web3modal/appkit/react'

export function AppKitInfo() {
  const state = useAppKitState()

  return (
    <Card marginTop={20}>
      <CardHeader>
        <Heading size="md">AppKit Status</Heading>
      </CardHeader>

      <CardBody>
        <Stack divider={<StackDivider />} spacing="4">
          <Box>
            <Heading size="xs" textTransform="uppercase" pb="2">
              Active Network
            </Heading>
            <Box>{state.selectedNetworkId}</Box>
          </Box>
          <Box>
            <Heading size="xs" textTransform="uppercase" pb="2">
              Active Chain
            </Heading>
            <Box>{state.activeChain}</Box>
          </Box>
        </Stack>
      </CardBody>
    </Card>
  )
}

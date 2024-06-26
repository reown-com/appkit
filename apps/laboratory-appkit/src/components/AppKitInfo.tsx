import { useAppKitState } from '@web3modal/appkit/react'
import { Stack, Card, CardHeader, Heading, CardBody, Box, StackDivider } from '@chakra-ui/react'

export function AppKitInfo() {
  const { open } = useAppKitState()

  return (
    <Card marginTop={20}>
      <CardHeader>
        <Heading size="md">Web3Modal Interactions</Heading>
      </CardHeader>

      <CardBody>
        <Stack divider={<StackDivider />} spacing="4">
          <Box>
            <Heading size="xs" textTransform="uppercase" pb="2">
              Is it open
            </Heading>
            {open ? 'Yes' : 'No'}
          </Box>
        </Stack>
      </CardBody>
    </Card>
  )
}

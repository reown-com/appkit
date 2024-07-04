import { useAppKitState } from '@web3modal/appkit/react'
import { Stack, Card, CardHeader, Heading, CardBody, Box, StackDivider } from '@chakra-ui/react'
import { WagmiTests } from './Wagmi/WagmiTests'

export function AppKitInfo() {
  const { open, activeChain } = useAppKitState()

  return (
    <>
      {activeChain === 'evm' ? <WagmiTests /> : null}
      <Card marginTop={10} marginBottom={10}>
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
            <Box>
              <Heading size="xs" textTransform="uppercase" pb="2">
                Active chain
              </Heading>
              {activeChain}
            </Box>
          </Stack>
        </CardBody>
      </Card>
    </>
  )
}

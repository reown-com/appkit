import { Stack, Card, CardHeader, Heading, CardBody, Box, StackDivider } from '@chakra-ui/react'
import { useWeb3Modal } from '@web3modal/ethers/react'

export function Web3ModalButtons() {
  const modal = useWeb3Modal()

  return (
    <Card marginTop={20}>
      <CardHeader>
        <Heading size="md">Web3Modal Interactions</Heading>
      </CardHeader>

      <CardBody>
        <Stack divider={<StackDivider />} spacing="4">
          <Box>
            <Heading size="xs" textTransform="uppercase" pb="2">
              Connect / Account Button
            </Heading>
            <w3m-button />
          </Box>

          <Box>
            <Heading size="xs" textTransform="uppercase" pb="2">
              Network Button
            </Heading>
            <w3m-network-button />
          </Box>
          <Box>
            <Heading size="xs" textTransform="uppercase" pb="2">
              Open W3M Buy in progress
            </Heading>
            <button onClick={() => modal.open({ view: 'BuyInProgress' })}>Open</button>
          </Box>
        </Stack>
      </CardBody>
    </Card>
  )
}

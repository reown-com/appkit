import { useAppKit } from '@reown/appkit/react'
import {
  Stack,
  Card,
  CardHeader,
  Heading,
  CardBody,
  Box,
  StackDivider,
  Button
} from '@chakra-ui/react'

export function AppKitButtons() {
  const { open } = useAppKit()

  return (
    <Card marginTop={10}>
      <CardHeader>
        <Heading size="md">AppKit Interactions</Heading>
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
              Hooks Interactions
            </Heading>
            <Button data-testid="w3m-open-hook-button" onClick={() => open()}>
              Open
            </Button>
          </Box>
        </Stack>
      </CardBody>
    </Card>
  )
}

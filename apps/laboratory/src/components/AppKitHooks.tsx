import { useAppKit, useDisconnect, useAppKitAccount } from '@reown/appkit/react'
import { Heading, Box, Button } from '@chakra-ui/react'

export function AppKitHooks() {
  const { open } = useAppKit()
  const { isConnected } = useAppKitAccount()
  const { disconnect } = useDisconnect()

  return (
    <Box>
      <Heading size="xs" textTransform="uppercase" pb="2">
        Hooks Interactions
      </Heading>
      <Box display="flex" alignItems="center" columnGap={3}>
        <Button data-testid="w3m-open-hook-button" onClick={() => open()}>
          Open
        </Button>

        <Button
          data-testid="disconnect-hook-button"
          isDisabled={!isConnected}
          onClick={() => disconnect()}
        >
          Disconnect
        </Button>
      </Box>
    </Box>
  )
}

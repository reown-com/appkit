import { PageController } from '../../controllers/PageController'
import { Box } from '../Box'
import { Button } from '../Button'
import { Logo } from '../Logo'
import { Text } from '../Text'

export function ChooseNetwork() {
  return (
    <Box width="full" style={{ padding: '26px' }}>
      <Box
        display="flex"
        alignItems="center"
        justifyContent="center"
        flexDirection="column"
        gap="20"
        background="black"
        padding="20"
        borderRadius="20"
      >
        <Logo height="137" width="36" />
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          flexDirection="column"
          gap="4"
        >
          <Text as="h1" fontSize="18" color="accent030">
            Reown BX Wallet
          </Text>
          <Text as="p" fontSize="14" textAlign="center">
            Choose your wallet to get started
          </Text>
        </Box>

        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          flexDirection="column"
          gap="8"
          marginTop="14"
        >
          <Button active="shrink" hover="grow" onClick={() => PageController.setPage('ethereum')}>
            Continue with Ethereum
          </Button>
          <Text as="p" fontSize="14" textAlign="center">
            or
          </Text>
          <Button active="shrink" hover="grow" onClick={() => PageController.setPage('solana')}>
            Continue with Solana
          </Button>
        </Box>
      </Box>
    </Box>
  )
}

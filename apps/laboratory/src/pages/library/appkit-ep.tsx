import { createAppKit } from '@web3modal/appkit/react'
import { ThemeStore } from '../../utils/StoreUtil'
import { ConstantsUtil } from '../../utils/ConstantsUtil'
import { siweConfig } from '../../utils/SiweUtils'
import { EthereumAdapterClient } from '@web3modal/adapters'
import { AppKitInfo } from '../../components/AppKitStatus'
import { EthersConstants } from '../../utils/EthersConstants'
import {
  Stack,
  Card,
  CardHeader,
  Heading,
  CardBody,
  Box,
  StackDivider,
  Button,
  IconButton
} from '@chakra-ui/react'

const ethereumAdapter = new EthereumAdapterClient({
  chains: EthersConstants.chains,
  metadata: ConstantsUtil.Metadata
})

const modal = createAppKit({
  adapters: [ethereumAdapter],
  projectId: ConstantsUtil.ProjectId,
  enableAnalytics: true,
  metadata: ConstantsUtil.Metadata,
  termsConditionsUrl: 'https://walletconnect.com/terms',
  privacyPolicyUrl: 'https://walletconnect.com/privacy',
  enableOnramp: true,
  siweConfig,
  // customWallets: ConstantsUtil.CustomWallets,
  enableWalletFeatures: true
})

ThemeStore.setModal(modal)

export default function AppKit() {
  return (
    <>
      <Card marginTop={20}>
        <CardHeader>
          <Heading size="md">AppKit - Ethereum Provider</Heading>
        </CardHeader>

        <CardBody>
          <Stack divider={<StackDivider />} spacing="4">
            <Box>
              <Heading size="xs" textTransform="uppercase" pb="2">
                Connect Button
              </Heading>
              <Button
                onClick={() => {
                  modal.open()
                }}
                colorScheme="blue"
              >
                WalletConnect
              </Button>
            </Box>
          </Stack>
        </CardBody>
      </Card>
    </>
  )
}

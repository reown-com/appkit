import { Center, Text, VStack } from '@chakra-ui/react'
import { createWeb3Modal, defaultSolanaConfig } from '@web3modal/solana/react'

import { ThemeStore } from '../../utils/StoreUtil'
import { NetworksButton } from '../../components/NetworksButton'
import {
  solana, solanaDevnet, solanaTestnet
} from '../../utils/ChainsUtil'

const projectId = process.env['NEXT_PUBLIC_PROJECT_ID']
if (!projectId) {
  throw new Error('NEXT_PUBLIC_PROJECT_ID is not set')
}

const chains = [
  solana,
  solanaTestnet,
  solanaDevnet
]

const metadata = {
  name: 'Web3Modal',
  description: 'Web3Modal Laboratory',
  url: 'https://web3modal.com',
  icons: ['https://avatars.githubusercontent.com/u/37784886']
}

export const solanaConfig = defaultSolanaConfig({
  chains,
  projectId,
  metadata,
})

const modal = createWeb3Modal({
  solanaConfig,
  projectId,
  chains,
  enableAnalytics: false,
  metadata,
  termsConditionsUrl: 'https://walletconnect.com/terms',
  privacyPolicyUrl: 'https://walletconnect.com/privacy',
})

ThemeStore.setModal(modal)

export default function Solana() {
  return (
    <>
      <Center paddingTop={10}>
        <Text fontSize="xl" fontWeight={700}>
          Solana default
        </Text>
      </Center>
      <Center h="65vh">
        <VStack gap={4}>
          <w3m-connect-button />
          <NetworksButton />
        </VStack>
      </Center>
    </>
  )
}

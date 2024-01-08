import { Center, Text, VStack } from '@chakra-ui/react'
import { createWeb3Modal, defaultWagmiConfig } from '@web3modal/wagmi/react'
import { useEffect, useState } from 'react'
import { WagmiConfig } from 'wagmi'
import {
  arbitrum,
  aurora,
  avalanche,
  base,
  bsc,
  celo,
  gnosis,
  mainnet,
  optimism,
  polygon,
  zkSync,
  zora,
  goerli,
  sepolia
} from 'wagmi/chains'
import { WagmiConnectButton } from '../../components/Wagmi/WagmiConnectButton'
import { NetworksButton } from '../../components/NetworksButton'
import { ThemeStore } from '../../utils/StoreUtil'

// 1. Get projectId
const projectId = process.env['NEXT_PUBLIC_PROJECT_ID']
if (!projectId) {
  throw new Error('NEXT_PUBLIC_PROJECT_ID is not set')
}

// 2. Create wagmiConfig
const chains = [
  mainnet,
  arbitrum,
  polygon,
  avalanche,
  bsc,
  optimism,
  gnosis,
  zkSync,
  zora,
  base,
  celo,
  aurora,
  goerli,
  sepolia
]

const metadata = {
  name: 'Web3Modal',
  description: 'Web3Modal Laboratory',
  url: 'https://web3modal.com',
  icons: ['https://avatars.githubusercontent.com/u/37784886']
}

export const wagmiConfig = defaultWagmiConfig({
  chains,
  projectId,
  metadata,
  enableEmail: true
})

const modal = createWeb3Modal({
  wagmiConfig,
  projectId,
  chains,
  enableAnalytics: true,
  metadata,
  termsConditionsUrl: 'https://walletconnect.com/terms',
  privacyPolicyUrl: 'https://walletconnect.com/privacy'
})

ThemeStore.setModal(modal)

export default function Wagmi() {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    setReady(true)
  }, [])

  return ready ? (
    <WagmiConfig config={wagmiConfig}>
      <Center paddingTop={10}>
        <Text fontSize="xl" fontWeight={700}>
          Wagmi with email
        </Text>
      </Center>
      <Center h="65vh">
        <VStack gap={4}>
          <WagmiConnectButton />
          <NetworksButton />
        </VStack>
      </Center>
    </WagmiConfig>
  ) : null
}

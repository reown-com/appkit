import { Center, Text, VStack, useColorMode } from '@chakra-ui/react'
import { createWeb3Modal, defaultWagmiConfig, useWeb3ModalTheme } from '@web3modal/wagmi/react'
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
  zora
} from 'wagmi/chains'
import { WagmiConnectButton } from '../../components/WagmiConnectButton'
import { NetworksButton } from '../../components/NetworksButton'

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
  aurora
]
export const wagmiConfig = defaultWagmiConfig({
  chains,
  projectId,
  metadata: {
    name: 'Web3Modal',
    description: 'Web3Modal Laboratory',
    url: 'https://web3modal.com',
    icons: ['https://avatars.githubusercontent.com/u/37784886']
  }
})

export default function Wagmi() {
  const [ready, setReady] = useState(false)
  const { colorMode } = useColorMode()
  const { setThemeMode } = useWeb3ModalTheme()

  // 3. Create Web3Modal
  createWeb3Modal({
    wagmiConfig,
    projectId,
    chains
  })

  useEffect(() => {
    setReady(true)
  }, [])

  useEffect(() => {
    setThemeMode(colorMode)
  }, [colorMode])

  return ready ? (
    <WagmiConfig config={wagmiConfig}>
      <Center paddingTop={10}>
        <Text fontSize="xl" fontWeight={700}>
          V3 with Wagmi
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

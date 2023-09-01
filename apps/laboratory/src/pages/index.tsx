import { Center, VStack, useColorMode } from '@chakra-ui/react'
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
import { ConnectButton } from '../components/ConnectButton'
import { NetworksButton } from '../components/NetworksButton'

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
export const wagmiConfig = defaultWagmiConfig({ chains, projectId, appName: 'Web3Modal' })

// 3. Create Web3Modal
export const modal = createWeb3Modal({
  wagmiConfig,
  projectId,
  chains,
  featuredWalletIds: [
    'c03dfee351b6fcc421b4494ea33b9d4b92a984f87aa76d1663bb28705e95034a',
    '8a0ee50d1f22f6651afcae7eb4253e52a3310b90af5daef78a8c4929a9bb99d4',
    '85db431492aa2e8672e93f4ea7acf10c88b97b867b0d373107af63dc4880f041',
    '225affb176778569276e484e1b92637ad061b01e13a048b35a9d280c3b58970f'
  ]
})

export default function HomePage() {
  const [ready, setReady] = useState(false)
  const { colorMode } = useColorMode()
  const { setThemeMode } = useWeb3ModalTheme()

  useEffect(() => {
    setReady(true)
  }, [])

  useEffect(() => {
    setThemeMode(colorMode)
  }, [colorMode])

  return ready ? (
    <WagmiConfig config={wagmiConfig}>
      <Center h="80vh">
        <VStack gap={4}>
          <ConnectButton />
          <NetworksButton />
        </VStack>
      </Center>
    </WagmiConfig>
  ) : null
}

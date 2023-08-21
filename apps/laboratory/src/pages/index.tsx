import { Center, VStack, useColorMode } from '@chakra-ui/react'
import { createWeb3Modal, defaultWagmiConfig, useWeb3ModalTheme } from '@web3modal/wagmi/react'
import { useEffect, useState } from 'react'
import { WagmiConfig } from 'wagmi'
import { arbitrum, avalanche, bsc, gnosis, mainnet, optimism, polygon, zkSync } from 'wagmi/chains'
import { ConnectButton } from '../components/ConnectButton'
import { NetworksButton } from '../components/NetworksButton'
import useThemeStore from '../utils/StoreUtil'
import { setThemeVariables } from '@web3modal/ui'

// 1. Get projectId
const projectId = process.env['NEXT_PUBLIC_PROJECT_ID']
if (!projectId) {
  throw new Error('NEXT_PUBLIC_PROJECT_ID is not set')
}

// 2. Create wagmiConfig
const chains = [mainnet, arbitrum, polygon, avalanche, bsc, optimism, gnosis, zkSync]
const wagmiConfig = defaultWagmiConfig({ chains, projectId, appName: 'Web3Modal' })

// 3. Create Web3Modal
createWeb3Modal({ wagmiConfig, projectId, chains })

export default function HomePage() {
  const [ready, setReady] = useState(false)

  const { colorMode } = useColorMode()

  const { setThemeMode } = useWeb3ModalTheme()

  const themeVariables = useThemeStore(state => state.themeVariables)

  useEffect(() => {
    setReady(true)
  }, [])

  useEffect(() => {
    setThemeMode(colorMode)
  }, [colorMode])

  useEffect(() => {
    setThemeVariables(themeVariables)
  }, [themeVariables])

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

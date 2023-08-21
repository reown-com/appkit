import { Button, Center, Select, VStack, useColorMode } from '@chakra-ui/react'
import { createWeb3Modal, defaultWagmiConfig } from '@web3modal/wagmi/react'
import { useEffect, useState } from 'react'
import { WagmiConfig } from 'wagmi'
import { arbitrum, avalanche, bsc, gnosis, mainnet, optimism, polygon, zkSync } from 'wagmi/chains'
import { ConnectButton } from '../components/ConnectButton'
import { NetworksButton } from '../components/NetworksButton'
import { themes } from '../utils/DataUtil'

// 1. Get projectId
const projectId = process.env['NEXT_PUBLIC_PROJECT_ID']
if (!projectId) {
  throw new Error('NEXT_PUBLIC_PROJECT_ID is not set')
}

// 2. Create wagmiConfig
const chains = [mainnet, arbitrum, polygon, avalanche, bsc, optimism, gnosis, zkSync]
const wagmiConfig = defaultWagmiConfig({ chains, projectId, appName: 'Web3Modal' })

// 3. Create Web3Modal
const modal = createWeb3Modal({ wagmiConfig, projectId, chains })

export default function HomePage() {
  const { colorMode, toggleColorMode } = useColorMode()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    setReady(true)
  }, [])

  useEffect(() => {
    modal.setThemeMode(colorMode)
  }, [colorMode])

  return ready ? (
    <WagmiConfig config={wagmiConfig}>
      <Center h="100vh">
        <VStack gap={4}>
          <Select
            placeholder="Select theme"
            onChange={e => {
              const selectedTheme = themes.find(theme => theme.name === e.target.value)
              if (selectedTheme) {
                modal.setThemeVariables(selectedTheme.theme)
              }
            }}
          >
            {themes.map(theme => (
              <option key={theme.name} value={theme.name}>
                {theme.name}
              </option>
            ))}
          </Select>
          <ConnectButton />
          <NetworksButton />
          <Button onClick={toggleColorMode}>
            {colorMode === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
          </Button>
        </VStack>
      </Center>
    </WagmiConfig>
  ) : null
}

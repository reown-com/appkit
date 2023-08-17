import { Button, Center, Select, VStack, useColorMode } from '@chakra-ui/react'
import { Web3Modal, walletConnectProvider } from '@web3modal/wagmi'
import { useEffect, useState } from 'react'
import { WagmiConfig, configureChains, createConfig } from 'wagmi'
import { arbitrum, avalanche, bsc, gnosis, mainnet, optimism, polygon, zkSync } from 'wagmi/chains'
import { CoinbaseWalletConnector } from 'wagmi/connectors/coinbaseWallet'
import { InjectedConnector } from 'wagmi/connectors/injected'
import { WalletConnectConnector } from 'wagmi/connectors/walletConnect'
import { ConnectButton } from '../components/ConnectButton'
import { NetworksButton } from '../components/NetworksButton'
import { themes } from '../utils/DataUtil'

// 1. Get projectId
const projectId = process.env['NEXT_PUBLIC_PROJECT_ID']
if (!projectId) {
  throw new Error('NEXT_PUBLIC_PROJECT_ID is not set')
}

// 2. Create wagmiConfig
const { chains, publicClient } = configureChains(
  [mainnet, arbitrum, polygon, avalanche, bsc, optimism, gnosis, zkSync],
  [walletConnectProvider({ projectId })]
)
const wagmiConfig = createConfig({
  autoConnect: true,
  connectors: [
    new WalletConnectConnector({ chains, options: { projectId, showQrModal: false } }),
    new InjectedConnector({ chains, options: { shimDisconnect: true } }),
    new CoinbaseWalletConnector({ chains, options: { appName: 'Web3Modal' } })
  ],
  publicClient
})

// 3. Create Web3Modal
export const modal = new Web3Modal({
  wagmiConfig,
  projectId,
  chains,
  themeMode: 'dark'
})

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
              modal.setThemeVariables({ 'w3m-accent': `${e.target.value}` })
            }}
          >
            {themes.map(theme => (
              <option value={`${theme.color}`}>{theme.name}</option>
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

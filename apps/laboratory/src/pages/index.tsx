import { Center } from '@chakra-ui/react'
import { Web3Modal } from '@web3modal/wagmi'
import { useEffect, useState } from 'react'
import { WagmiConfig, configureChains, createConfig, mainnet } from 'wagmi'
import { CoinbaseWalletConnector } from 'wagmi/connectors/coinbaseWallet'
import { InjectedConnector } from 'wagmi/connectors/injected'
import { WalletConnectConnector } from 'wagmi/connectors/walletConnect'
import { publicProvider } from 'wagmi/providers/public'
import { ConnectButton } from '../components/ConnectButton'

// 1. Get projectId
const projectId = process.env.NEXT_PUBLIC_PROJECT_ID
if (!projectId) {
  throw new Error('NEXT_PUBLIC_PROJECT_ID is not set')
}

// 2. Create wagmiConfig
const { chains, publicClient } = configureChains([mainnet], [publicProvider()])
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
const modal = new Web3Modal({ wagmiConfig, projectId })

// 4. Create Home page
export default function Home() {
  const [ready, setReady] = useState(false)

  async function openModal() {
    await modal.open()
  }

  useEffect(() => {
    setReady(true)
  }, [])

  return ready ? (
    <WagmiConfig config={wagmiConfig}>
      <Center h="100vh">
        <ConnectButton onConnect={openModal} />
      </Center>
    </WagmiConfig>
  ) : null
}

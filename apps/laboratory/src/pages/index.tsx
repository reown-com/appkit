import { Button, Center, VStack } from '@chakra-ui/react'
import { Web3Modal } from '@web3modal/wagmi'
import { WagmiConfig, configureChains, createConfig, mainnet } from 'wagmi'
import { CoinbaseWalletConnector } from 'wagmi/connectors/coinbaseWallet'
import { InjectedConnector } from 'wagmi/connectors/injected'
import { WalletConnectConnector } from 'wagmi/connectors/walletConnect'
import { publicProvider } from 'wagmi/providers/public'

// 1. Get projectId
const projectId = process.env.NEXT_PUBLIC_PROJECT_ID
if (!projectId) {
  throw new Error('NEXT_PUBLIC_PROJECT_ID is not set')
}

// 2. Create wagmiConfig
const { publicClient } = configureChains([mainnet], [publicProvider()])
const wagmiConfig = createConfig({
  autoConnect: true,
  connectors: [
    new WalletConnectConnector({ options: { projectId } }),
    new InjectedConnector({ options: { shimDisconnect: true } }),
    new CoinbaseWalletConnector({ options: { appName: 'Web3Modal' } })
  ],
  publicClient
})

// 3. Create Web3Modal
const modal = new Web3Modal({ wagmiConfig })

// 4. Create Home page
export default function Home() {
  async function openModal() {
    await modal.open()
  }

  return (
    <WagmiConfig config={wagmiConfig}>
      <Center h="100vh">
        <VStack>
          <Button onClick={openModal}>Connect Wallet</Button>
        </VStack>
      </Center>
    </WagmiConfig>
  )
}

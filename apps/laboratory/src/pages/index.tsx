import { Button, Center, VStack } from '@chakra-ui/react'
import { Web3Modal } from '@web3modal/wagmi'
import { WagmiConfig, configureChains, createConfig, mainnet } from 'wagmi'
import { WalletConnectConnector } from 'wagmi/connectors/walletConnect'
import { publicProvider } from 'wagmi/providers/public'

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
    new WalletConnectConnector({
      chains,
      options: { projectId }
    })
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

  async function closeModal() {
    await modal.close()
  }

  return (
    <WagmiConfig config={wagmiConfig}>
      <Center h="100vh">
        <VStack>
          <Button onClick={openModal}>Open Modal</Button>
          <Button onClick={closeModal}>Close Modal</Button>
        </VStack>
      </Center>
    </WagmiConfig>
  )
}

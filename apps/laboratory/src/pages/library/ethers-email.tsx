import { Center, Text, VStack } from '@chakra-ui/react'
import { EthersConnectButton } from '../../components/Ethers/EthersConnectButton'
import { createWeb3Modal, defaultConfig } from '@web3modal/ethers/react'
import { ThemeStore } from '../../utils/StoreUtil'
import {
  arbitrum,
  aurora,
  avalanche,
  base,
  binanceSmartChain,
  celo,
  gnosis,
  mainnet,
  optimism,
  polygon,
  zkSync,
  zora
} from '../../utils/ChainsUtil'

const projectId = process.env['NEXT_PUBLIC_PROJECT_ID']
if (!projectId) {
  throw new Error('NEXT_PUBLIC_PROJECT_ID is not set')
}
const chains = [
  mainnet,
  arbitrum,
  polygon,
  avalanche,
  binanceSmartChain,
  optimism,
  gnosis,
  zkSync,
  zora,
  base,
  celo,
  aurora
]

const metadata = {
  name: 'Web3Modal',
  description: 'Web3Modal Laboratory',
  url: 'https://web3modal.com',
  icons: ['https://avatars.githubusercontent.com/u/37784886']
}

const modal = createWeb3Modal({
  ethersConfig: defaultConfig({
    metadata,
    defaultChainId: 1,
    rpcUrl: 'https://cloudflare-eth.com',
    enableEmail: true
  }),
  chains,
  projectId,
  enableAnalytics: true,
  metadata,
  termsConditionsUrl: 'https://walletconnect.com/terms',
  privacyPolicyUrl: 'https://walletconnect.com/privacy'
})

ThemeStore.setModal(modal)

export default function Ethers() {
  return (
    <>
      <Center paddingTop={10}>
        <Text fontSize="xl" fontWeight={700}>
          Ethers with email
        </Text>
      </Center>
      <Center h="65vh">
        <VStack gap={4}>
          <EthersConnectButton />
          <w3m-network-button />
        </VStack>
      </Center>
    </>
  )
}

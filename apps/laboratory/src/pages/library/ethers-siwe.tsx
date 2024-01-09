import { Center, Text, VStack } from '@chakra-ui/react'
import { EthersConnectButton } from '../../components/Ethers/EthersConnectButton'
import { createWeb3Modal, defaultConfig } from '@web3modal/ethers5/react'
import { SiweMessage } from 'siwe'
import { getCsrfToken, getSession, signIn, signOut, useSession } from 'next-auth/react'
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
import type { SIWECreateMessageArgs, SIWESession, SIWEVerifyMessageArgs } from '@web3modal/core'
import { createSIWEConfig } from '@web3modal/siwe'
import { ConstantsUtil } from '../../utils/ConstantsUtil'

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

const siweConfig = createSIWEConfig({
  createMessage: ({ nonce, address, chainId }: SIWECreateMessageArgs) =>
    new SiweMessage({
      version: '1',
      domain: window.location.host,
      uri: window.location.origin,
      address,
      chainId,
      nonce,
      // Human-readable ASCII assertion that the user will sign, and it must not contain `\n`.
      statement: 'Sign in With Ethereum.'
    }).prepareMessage(),
  getNonce: async () => {
    const nonce = await getCsrfToken()
    if (!nonce) {
      throw new Error('Failed to get nonce!')
    }

    return nonce
  },
  getSession: async () => {
    const session = await getSession()
    if (!session) {
      throw new Error('Failed to get session!')
    }

    const { address, chainId } = session as unknown as SIWESession

    return { address, chainId }
  },
  verifyMessage: async ({ message, signature }: SIWEVerifyMessageArgs) => {
    try {
      const success = await signIn('credentials', {
        message,
        redirect: false,
        signature,
        callbackUrl: '/protected'
      })

      return Boolean(success?.ok)
    } catch (error) {
      return false
    }
  },
  signOut: async () => {
    try {
      await signOut({
        redirect: false
      })

      return true
    } catch (error) {
      return false
    }
  }
})

const modal = createWeb3Modal({
  ethersConfig: defaultConfig({
    metadata,
    defaultChainId: 1,
    rpcUrl: 'https://cloudflare-eth.com'
  }),
  chains,
  projectId,
  enableAnalytics: true,
  metadata,
  siweConfig
})

ThemeStore.setModal(modal)

export default function EthersSiwe() {
  const { data, status } = useSession()
  const session = data as unknown as SIWESession

  return (
    <>
      <Center paddingTop={10}>
        <Text fontSize="xl" fontWeight={700}>
          Ethers with SIWE
        </Text>
      </Center>
      <Center h="65vh">
        <VStack gap={4}>
          <Text data-testid={ConstantsUtil.TestIdSiweAuthenticationStatus}>
            SIWE Status: {status}
          </Text>
          {session && (
            <>
              <Text>Network: eip155:{session.chainId}</Text>
              <VStack>
                <Text>Address:</Text>
                <Text isTruncated={true} fontSize="sm">
                  {session.address}
                </Text>
              </VStack>
            </>
          )}
          <EthersConnectButton />
          <w3m-network-button />
        </VStack>
      </Center>
    </>
  )
}

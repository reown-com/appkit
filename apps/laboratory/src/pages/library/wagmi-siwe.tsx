import { Center, CheckboxGroup, Text, VStack } from '@chakra-ui/react'
import { createWeb3Modal, defaultWagmiConfig } from '@web3modal/wagmi/react'
import { useEffect, useState } from 'react'
import { WagmiConfig } from 'wagmi'
import { disconnect } from '@wagmi/core'
import { SiweMessage } from 'siwe'
import { getCsrfToken, signIn, signOut, getSession } from 'next-auth/react'
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
import { WagmiConnectButton } from '../../components/Wagmi/WagmiConnectButton'
import { NetworksButton } from '../../components/NetworksButton'
import { ThemeStore } from '../../utils/StoreUtil'
import type { SIWESession } from '@web3modal/core'
import type { SIWEVerifyMessageArgs, SIWECreateMessageArgs } from '@web3modal/core'

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

const metadata = {
  name: 'Web3Modal',
  description: 'Web3Modal Laboratory',
  url: 'https://web3modal.com',
  icons: ['https://avatars.githubusercontent.com/u/37784886']
}

export const wagmiConfig = defaultWagmiConfig({
  chains,
  projectId,
  metadata
})

const modal = createWeb3Modal({
  wagmiConfig,
  projectId,
  chains,
  enableAnalytics: true,
  metadata,
  siweConfig: {
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

      return session as unknown as SIWESession
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
        await signOut()
        await disconnect()

        return true
      } catch (error) {
        return false
      }
    }
  }
})

ThemeStore.setModal(modal)

export default function Wagmi() {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    setReady(true)
  }, [])

  return ready ? (
    <WagmiConfig config={wagmiConfig}>
      <Center paddingTop={10}>
        <Text fontSize="xl" fontWeight={700}>
          V3 with SIWE and wagmi
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

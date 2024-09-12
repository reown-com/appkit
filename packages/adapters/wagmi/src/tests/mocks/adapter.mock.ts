import { mock } from 'wagmi/connectors'
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts'
import { AppKit } from '@rerock/appkit'
import { EVMWagmiClient } from '../../client'
import { arbitrum, mainnet } from '@rerock/appkit/chains'
import type { CaipNetwork } from '@rerock/appkit-common'
import type { SdkVersion } from '@rerock/appkit-core'

const privateKey = generatePrivateKey()
export const mockAccount = privateKeyToAccount(privateKey)

export const mockWagmiClient = new EVMWagmiClient({
  connectors: [mock({ accounts: [mockAccount.address] })],
  caipNetworks: [mainnet, arbitrum],
  projectId: '1234'
})

export const mockWagmiConfig = mockWagmiClient.wagmiConfig

export const mockOptions = {
  adapters: [mockWagmiClient],
  caipNetworks: [mainnet, arbitrum],
  enableInjected: false,
  enableCoinbase: false,
  enableWalletConnect: false,
  features: {
    email: false,
    socials: []
  },
  metadata: {
    description: 'Desc',
    name: 'Name',
    url: 'url.com',
    icons: ['icon.png']
  },
  projectId: '1234',
  sdkVersion: `html-wagmi-5.1.6` as SdkVersion
}

export const mockAppKit = new AppKit(mockOptions)

export const mockChain = {
  id: 'eip155:1',
  name: 'Ethereum',
  chainId: 1,
  chainNamespace: 'eip155',
  currency: 'ETH',
  explorerUrl: 'https://etherscan.io',
  rpcUrl: 'https://rpc.example.com'
} as CaipNetwork

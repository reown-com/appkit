import { mainnet as wagmiMainnet, arbitrum as wagmiArbitrum } from 'viem/chains'
import { createConfig, http } from 'wagmi'
import { mock } from 'wagmi/connectors'
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts'
import { AppKit } from '@web3modal/base'
import { EVMWagmiClient } from '../../client'
import { arbitrum, mainnet } from '@web3modal/base/chains'
import type { CaipNetwork } from '@web3modal/common'

const privateKey = generatePrivateKey()
export const mockAccount = privateKeyToAccount(privateKey)

export const mockWagmiConfig = createConfig({
  chains: [wagmiMainnet, wagmiArbitrum],
  connectors: [mock({ accounts: [mockAccount.address] })],
  transports: {
    [wagmiMainnet.id]: http(),
    [wagmiArbitrum.id]: http()
  }
})

export const mockWagmiClient = new EVMWagmiClient({
  chains: [wagmiMainnet, wagmiArbitrum],
  connectors: [mock({ accounts: [mockAccount.address] })],
  transports: {
    [wagmiMainnet.id]: http(),
    [wagmiArbitrum.id]: http()
  }
})

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
  projectId: '1234'
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

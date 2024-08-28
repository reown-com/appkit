import { EVMWagmiClient } from '@web3modal/base/adapters/evm/wagmi'
import { mainnet as wagmiMainnet } from 'viem/chains'
import { createConfig, http } from 'wagmi'
import { mock } from 'wagmi/connectors'

import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts'
import { AppKit } from '@web3modal/base'
import type { CaipNetwork } from '@web3modal/common'

export const mainnet: CaipNetwork = {
  id: 'eip155:1',
  chainId: 1,
  name: 'Ethereum',
  currency: 'ETH',
  explorerUrl: 'https://etherscan.io',
  rpcUrl: 'https://rpc.walletconnect.org/v1/?chainId=eip155:1&projectId=PROJECT_ID',
  chainNamespace: 'eip155'
}

const privateKey = generatePrivateKey()
export const mockAccount = privateKeyToAccount(privateKey)

export const wagmiConfigMock = createConfig({
  chains: [wagmiMainnet],
  connectors: [mock({ accounts: [mockAccount.address] })],
  transports: {
    [wagmiMainnet.id]: http()
  }
})

const wagmiAdapterMock = new EVMWagmiClient()

const mockAppKitData = {
  adapters: [wagmiAdapterMock],
  caipNetworks: [mainnet],
  defaultCaipNetwork: wagmiAdapterMock.defaultCaipNetwork,
  metadata: {
    description: 'Desc',
    name: 'Name',
    url: 'url.com',
    icons: ['icon.png']
  },
  projectId: '1234'
}

export const appKitMock = new AppKit(mockAppKitData)
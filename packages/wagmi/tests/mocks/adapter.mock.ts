import { EVMWagmiClient } from '@web3modal/base/adapters/evm/wagmi'
import { mainnet } from 'viem/chains'
import { createConfig, http } from 'wagmi'
import { mock } from 'wagmi/connectors'

import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts'
import { AppKit, type SdkVersion } from '@web3modal/base'

const privateKey = generatePrivateKey()
export const mockAccount = privateKeyToAccount(privateKey)

export const wagmiConfigMock = createConfig({
  chains: [mainnet],
  connectors: [mock({ accounts: [mockAccount.address] })],
  transports: {
    [mainnet.id]: http()
  }
})

const wagmiAdapterMock = new EVMWagmiClient({
  wagmiConfig: wagmiConfigMock
})

const mockAppKitData = {
  defaultChain: wagmiAdapterMock.defaultChain,
  adapters: [wagmiAdapterMock],
  metadata: {
    description: 'Desc',
    name: 'Name',
    url: 'url.com',
    icons: ['icon.png']
  },
  projectId: '1234',
  sdkVersion: 'react-wagmi-4.0.13' as SdkVersion,
  sdkType: 'w3m' as const
}

export const appKitMock = new AppKit(mockAppKitData)

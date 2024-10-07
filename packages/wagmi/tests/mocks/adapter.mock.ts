import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { createConfig, http } from 'wagmi'
import { mock } from 'wagmi/connectors'
import { mainnet } from '@reown/appkit/networks'

import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts'
import { AppKit, type SdkVersion } from '@reown/appkit'

const privateKey = generatePrivateKey()
export const mockAccount = privateKeyToAccount(privateKey)

export const wagmiConfigMock = createConfig({
  chains: [mainnet],
  connectors: [mock({ accounts: [mockAccount.address] })],
  transports: {
    [mainnet.id]: http()
  }
})

export const wagmiAdapterMock = new WagmiAdapter({
  chains: [mainnet],
  connectors: [mock({ accounts: [mockAccount.address] })],
  transports: {
    [mainnet.id]: http()
  },
  networks: [mainnet],
  projectId: '1234'
})

const mockAppKitData = {
  adapters: [wagmiAdapterMock],
  networks: wagmiAdapterMock.caipNetworks,
  defaultNetwork: mainnet,
  metadata: {
    description: 'Desc',
    name: 'Name',
    url: 'url.com',
    icons: ['icon.png']
  },
  projectId: '1234',
  sdkVersion: 'html-wagmi-5.1.6' as SdkVersion
}

export const appKitMock = new AppKit(mockAppKitData)

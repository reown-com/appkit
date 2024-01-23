import { defaultWagmiConfig } from '@web3modal/wagmi/react/config'
import { cookieStorage, createStorage } from 'wagmi'
import { mainnet, sepolia } from 'wagmi/chains'

console.log('defaultWagmiConfig', typeof defaultWagmiConfig)

export const config = defaultWagmiConfig({
  projectId: 'bd4997ce3ede37c95770ba10a3804dad',
  chains: [mainnet, sepolia],
  metadata: {
    name: 'My App',
    description: 'My app description',
    url: 'https://myapp.com',
    icons: ['https://myapp.com/favicon.ico']
  },
  enableInjected: true,
  enableWalletConnect: true,
  enableEIP6963: true,
  enableCoinbase: true,
  enableEmail: true,
  storage: createStorage({
    storage: cookieStorage
  }),
  ssr: true
})

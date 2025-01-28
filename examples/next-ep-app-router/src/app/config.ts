import { EthereumProvider } from '@walletconnect/ethereum-provider'

const projectId = process.env.NEXT_PUBLIC_PROJECT_ID || 'b56e18d47c72ab683b10814fe9495694' // this is a public projectId only to use on localhost

const provider = await EthereumProvider.init({
  projectId,
  metadata: {
    name: 'AppKit Next.js Ethereum Provider Example',
    description: 'AppKit NextJS Ethereum Provider Example',
    url: 'https://reown.com/appkit',
    icons: ['https://avatars.githubusercontent.com/u/179229932?s=200&v=4']
  },
  showQrModal: true,
  qrModalOptions: {
    themeMode: 'light'
  },
  chains: [1, 137],
  optionalChains: [1, 137]
})

export { provider }

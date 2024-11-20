import { createWeb3Modal, defaultWagmiConfig } from '@web3modal/wagmi'
import { mainnet } from 'wagmi/chains'

const wagmiConfig = defaultWagmiConfig({
  chains: [mainnet],
  projectId: '3bdbc796b351092d40d5d08e987f4eca',
  metadata: {
    name: 'Base',
    description: 'Base',
    url: 'https://base.org',
    icons: ['https://base.org/logo.png']
  }
})

createWeb3Modal({
  wagmiConfig,
  projectId: '3bdbc796b351092d40d5d08e987f4eca'
})

export function App() {
  return (
    <div>
      <h1>Hello world1!</h1>
      <w3m-button />
    </div>
  )
}

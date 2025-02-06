import { createAppKit } from '@reown/appkit/basic'
import { mainnet, solana } from '@reown/appkit/networks'
import { useAppKit } from '@reown/appkit/react'

import ActionButtonList from './components/ActionButton'
import Footer from './components/Footer'
import InfoList from './components/InfoList'
import './config'

export const projectId = import.meta.env.VITE_PROJECT_ID || 'b56e18d47c72ab683b10814fe9495694' // this is a public projectId only to use on localhost

// Create modal
const modal = createAppKit({
  networks: [mainnet, solana],
  metadata: {
    name: 'AppKit React Example',
    description: 'AppKit React Ethers Example',
    url: 'https://reown.com/appkit',
    icons: ['https://avatars.githubusercontent.com/u/179229932?s=200&v=4']
  },
  featuredWalletIds: ['21030f20fba1a77115858ee3a8bc5841c739ab4537441316e2f4b1d0a8d218af'],
  projectId,
  themeMode: 'light'
})

export default function App() {
  return (
    <div className="page-container">
      <div className="logo-container">
        <img src="/appkit-logo.png" alt="Reown" width="150" />
      </div>

      <h1 className="page-title">React AppKit Basic Example</h1>

      <div className="appkit-buttons-container">
        <button onClick={() => modal.open()}>open</button>
      </div>
    </div>
  )
}

import { createWeb3Modal, defaultWagmiConfig, useWeb3Modal } from '@web3modal/wagmi/react'
import { WagmiConfig } from 'wagmi'
import { arbitrum, mainnet } from 'wagmi/chains'

// 1. Get projectId
const projectId = import.meta.env.VITE_PROJECT_ID
if (!projectId) {
  throw new Error('VITE_PROJECT_ID is not set')
}

// 2. Create wagmiConfig
const chains = [mainnet, arbitrum]
const wagmiConfig = defaultWagmiConfig({ chains, projectId, appName: 'Web3Modal' })

// 3. Create modal
createWeb3Modal({
  wagmiConfig,
  projectId,
  chains,
  themeMode: 'light',
  themeVariables: {
    '--w3m-color-mix': '#00DCFF',
    '--w3m-color-mix-strength': 50
  }
})

export default function App() {
  // 4. Use modal hook
  const modal = useWeb3Modal()

  return (
    <WagmiConfig config={wagmiConfig}>
      <button onClick={() => modal.open()}>Open Connect Modal</button>
      <button onClick={() => modal.open({ view: 'Networks' })}>Open Network Modal</button>
    </WagmiConfig>
  )
}

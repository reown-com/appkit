import { createAppKit } from '@reown/appkit-basic'
import type { AppKitNetwork } from '@reown/appkit-basic/networks'
import { mainnet } from '@reown/appkit-basic/networks'

export const projectId = 'b56e18d47c72ab683b10814fe9495694'

const appkit = createAppKit({
  networks: [mainnet] as [AppKitNetwork, ...AppKitNetwork[]],
  metadata: {
    name: 'AppKit React Example',
    description: 'AppKit React Wagmi Example',
    url: 'https://reown.com/appkit',
    icons: ['https://avatars.githubusercontent.com/u/179229932?s=200&v=4']
  },
  projectId,
  basic: true,
  themeMode: 'light',
  features: {
    analytics: true
  }
})

export default function App() {
  return (
    <>
      <h2>hey</h2>
      <button onClick={() => appkit.open()}>appkit</button>
    </>
  )
}

---
'@apps/demo': patch
'@apps/gallery': patch
'@apps/laboratory': patch
'@examples/html-ethers': patch
'@examples/html-ethers5': patch
'@examples/html-wagmi': patch
'@examples/next-ethers': patch
'@examples/next-wagmi': patch
'@examples/react-ethers': patch
'@examples/react-ethers5': patch
'@examples/react-solana': patch
'@examples/react-wagmi': patch
'@examples/vue-ethers5': patch
'@examples/vue-solana': patch
'@examples/vue-wagmi': patch
'@reown/appkit-adapter-ethers': patch
'@reown/appkit-adapter-ethers5': patch
'@reown/appkit-adapter-polkadot': patch
'@reown/appkit-adapter-solana': patch
'@reown/appkit-adapter-wagmi': patch
'@reown/appkit': patch
'@reown/appkit-utils': patch
'@reown/appkit-cdn': patch
'@reown/appkit-common': patch
'@reown/appkit-core': patch
'@reown/appkit-ethers': patch
'@reown/appkit-ethers5': patch
'@reown/appkit-polyfills': patch
'@reown/appkit-scaffold-ui': patch
'@reown/appkit-siwe': patch
'@reown/appkit-solana': patch
'@reown/appkit-ui': patch
'@reown/appkit-wagmi': patch
'@reown/appkit-wallet': patch
---

Introduced debug mode. This is useful for seeing UI alerts while debugging.

**Example usage**

```ts
import { createAppKit } from '@reown/appkit/react'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { mainnet } from '@reown/appkit/networks'

const wagmiAdapter = new WagmiAdapter({
  ssr: true,
  networks: [mainnet],
  projectId: 'YOUR_PROJECT_ID'
})

const modal = createAppKit({
  adapters: [wagmiAdapter],
  networks: [mainnet],
  projectId: 'YOUR_PROJECT_ID',
  debug: true // Optional - defaults to false
})
```
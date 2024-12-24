---
'@reown/appkit-adapter-solana': patch
'@reown/appkit-adapter-wagmi': patch
'@reown/appkit': patch
'@reown/appkit-wallet': patch
'@reown/appkit-core': patch
'sveltekit-ethers': patch
'@reown/appkit-adapter-bitcoin': patch
'@reown/appkit-adapter-ethers': patch
'@reown/appkit-adapter-ethers5': patch
'@reown/appkit-utils': patch
'@reown/appkit-cdn': patch
'@reown/appkit-cli': patch
'@reown/appkit-common': patch
'@reown/appkit-experimental': patch
'@reown/appkit-polyfills': patch
'@reown/appkit-scaffold-ui': patch
'@reown/appkit-siwe': patch
'@reown/appkit-siwx': patch
'@reown/appkit-ui': patch
'@reown/appkit-wallet-button': patch
---

Added a new option to enable or disable logs from email/social login.

**Example usage**

```ts
import { createAppKit } from '@reown/appkit/react'

const modal = createAppKit({
  adapters: [/* Adapters */],
  networks: [/* Networks */],
  projectId: 'YOUR_PROJECT_ID',
  enableAuthLogger: false, // Optional - defaults to true
})
```

---
'@reown/appkit-scaffold-ui': patch
'@reown/appkit': patch
'@reown/appkit-core': patch
'@reown/appkit-adapter-ethers': patch
'@reown/appkit-adapter-ethers5': patch
'@reown/appkit-adapter-solana': patch
'@reown/appkit-adapter-wagmi': patch
'@reown/appkit-utils': patch
'@reown/appkit-cdn': patch
'@reown/appkit-cli': patch
'@reown/appkit-common': patch
'@reown/appkit-experimental': patch
'@reown/appkit-polyfills': patch
'@reown/appkit-siwe': patch
'@reown/appkit-siwx': patch
'@reown/appkit-ui': patch
'@reown/appkit-wallet': patch
---

Added `enableWalletGuide` option to allow disabling the wallet guide footer when social or email logins are enabled.

**Example usage**

```ts
import { createAppKit } from '@reown/appkit'

const modal = createAppKit({
  adapters: [/* Adapters */],
  networks: [/* Networks */],
  projectId: 'YOUR_RPOJECT_ID',
  enableWalletGuide: false // Optional - defaults to true
})
```

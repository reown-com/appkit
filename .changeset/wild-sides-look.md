---
'@reown/appkit-controllers': patch
'@reown/appkit-scaffold-ui': patch
'@reown/appkit-adapter-bitcoin': patch
'@reown/appkit-adapter-ethers': patch
'@reown/appkit-adapter-ethers5': patch
'@reown/appkit-adapter-solana': patch
'@reown/appkit-adapter-wagmi': patch
'@reown/appkit': patch
'@reown/appkit-utils': patch
'@reown/appkit-cdn': patch
'@reown/appkit-cli': patch
'@reown/appkit-common': patch
'@reown/appkit-core': patch
'@reown/appkit-experimental': patch
'@reown/appkit-polyfills': patch
'@reown/appkit-siwe': patch
'@reown/appkit-siwx': patch
'@reown/appkit-ui': patch
'@reown/appkit-wallet': patch
'@reown/appkit-wallet-button': patch
---

Added support for customizing connector positions in connect modal. 

The array order determines the exact display order, in the example below the injected wallets will appear first, followed by WalletConnect and then recent wallets.

**Example usage**

```tsx
import { createAppKit } from '@reown/appkit'

const modal = createAppKit({
  adapters: [], // Add your adapters here
  networks: [], // Add your networks here
  projectId: 'YOUR_PROJECT_ID',
  features: {
    connectorTypeOrder: ['injected', 'walletConnect', 'recent']
  }
})
```

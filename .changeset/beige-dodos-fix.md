---
'@reown/appkit-scaffold-ui': patch
'@apps/laboratory': patch
'@reown/appkit': patch
'@reown/appkit-core': patch
'@apps/gallery': patch
'@reown/appkit-ui': patch
'@apps/demo': patch
'@reown/appkit-adapter-ethers': patch
'@reown/appkit-adapter-ethers5': patch
'@reown/appkit-adapter-polkadot': patch
'@reown/appkit-adapter-solana': patch
'@reown/appkit-adapter-wagmi': patch
'@reown/appkit-utils': patch
'@reown/appkit-cdn': patch
'@reown/appkit-common': patch
'@reown/appkit-experimental': patch
'@reown/appkit-polyfills': patch
'@reown/appkit-siwe': patch
'@reown/appkit-siwx': patch
'@reown/appkit-wallet': patch
---

Introduced a new feature with an option to enable the terms of service and/or privacy policy checkbox.

**Example usage**

```ts
import { createAppKit } from '@reown/appkit/react'
import { mainnet } from '@reown/appkit/networks'

const modal = createAppKit({
  adapters: [/* adapters */],
  networks: [mainnet],
  defaultNetwork: mainnet,
  projectId: 'YOUR_PROJECT_ID',
  features: {
    legalCheckbox: true // Optional - defaults to false
  },
  termsConditionsUrl: '...',
  privacyPolicyUrl: '...'
})
```
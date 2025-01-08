---
'@reown/appkit': patch
'@reown/appkit-wallet': patch
'@reown/appkit-core': patch
'@reown/appkit-adapter-bitcoin': patch
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
'@reown/appkit-scaffold-ui': patch
'@reown/appkit-siwe': patch
'@reown/appkit-siwx': patch
'@reown/appkit-ui': patch
'@reown/appkit-wallet-button': patch
---

Added embedded wallet info to `useAppKitAccount` hook.

**Example usage**

```tsx
import { useAppKitAccount } from '@reown/appkit/react'

export function YourApp() {
  const { embeddedWalletInfo } = useAppKitAccount()

  const email = embeddedWalletInfo.user?.email

  return email && <p>Email address: {email}</p>
}
```
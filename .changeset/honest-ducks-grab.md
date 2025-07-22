---
'@reown/appkit-wallet-button': patch
'@reown/appkit': patch
'@reown/appkit-adapter-bitcoin': patch
'@reown/appkit-adapter-ethers': patch
'@reown/appkit-adapter-ethers5': patch
'@reown/appkit-adapter-solana': patch
'@reown/appkit-adapter-wagmi': patch
'@reown/appkit-utils': patch
'@reown/appkit-cdn': patch
'@reown/appkit-cli': patch
'@reown/appkit-codemod': patch
'@reown/appkit-common': patch
'@reown/appkit-controllers': patch
'@reown/appkit-core': patch
'@reown/appkit-experimental': patch
'@reown/appkit-pay': patch
'@reown/appkit-polyfills': patch
'@reown/appkit-scaffold-ui': patch
'@reown/appkit-siwe': patch
'@reown/appkit-siwx': patch
'@reown/appkit-testing': patch
'@reown/appkit-ui': patch
'@reown/appkit-wallet': patch
---

Introduces AppKit React components. React users can now use the new components instead of HTML elements.

### Example

```jsx
import { AppKitButton, AppKitNetworkButton } from '@reown/appkit/react'
import { AppKitWalletButton } from '@reown/appkit-wallet-button/react'

export function AppKitButtons() {
  return (
    <div>
      {/* Default */}
      <AppkitButton />
      <AppKitNetworkButton />
      <AppKitWalletButton wallet="metamask" />
      {/* With parameters */}
      <AppkitButton namespace="eip155" />
    </div>
  )
}
```
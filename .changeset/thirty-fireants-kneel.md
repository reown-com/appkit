---
'@reown/appkit-adapter-bitcoin': patch
'@reown/appkit-adapter-ethers5': patch
'@reown/appkit-adapter-ethers': patch
'@reown/appkit-adapter-solana': patch
'@reown/appkit-adapter-wagmi': patch
'@reown/appkit-experimental': patch
'@reown/appkit-scaffold-ui': patch
'@reown/appkit': patch
'@reown/appkit-common': patch
'@reown/appkit-core': patch
'@reown/appkit-ui': patch
'@reown/appkit-utils': patch
'@reown/appkit-cdn': patch
'@reown/appkit-cli': patch
'@reown/appkit-polyfills': patch
'@reown/appkit-siwe': patch
'@reown/appkit-siwx': patch
'@reown/appkit-wallet': patch
'@reown/appkit-wallet-button': patch
---

Adds namespace parameter to AppKit buttons. 

This allows users to render namespace specific connect & account buttons. When namespace has passed, connect button opens connect page with only that namespace's connectors and account button shows only that namespace's account info.

**Example:**

```js
<appkit-button namespace="eip155" />
<appkit-button namespace="solana" />
<appkit-button namespace="bip122" />
```


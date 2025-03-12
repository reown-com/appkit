---
'@reown/appkit-controllers': patch
'@reown/appkit-scaffold-ui': patch
'@reown/appkit': patch
'@reown/appkit-adapter-bitcoin': patch
'@reown/appkit-adapter-ethers': patch
'@reown/appkit-adapter-ethers5': patch
'@reown/appkit-adapter-solana': patch
'@reown/appkit-adapter-wagmi': patch
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

Handles namespace switching when calling `open()` function. Passing `namespace` to `open()` function, AppKit will switch to that namespace. If namespace is connected, it'll open Account button, if not it'll open Connect screen. 

**Example:**

```jsx
const { open } = useAppKit()

open({ namespace: 'eip155' })
```

This could be combined with `view` parameter as well. It'll switch to that namespace and open relevant page.

**Example:**

```jsx
const { open } = useAppKit()

open({ view: 'Connect', namespace: 'eip155' })
```
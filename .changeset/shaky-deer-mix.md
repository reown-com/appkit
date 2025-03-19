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

Allows disconnecting specific namespace. Users can pass `ChainNamespace` value to `disconnect()` function returned from `useDisconnect`, and disconnect only given namespace.

If namespace is not passed, it'll disconnect all namespaces.

**Example usage:**

```tsx
const { disconnect } = useDisconnect()

<Button onClick={() => disconnect({ namespace: 'solana' })}>
  Disconnect Solana
</Button>
```
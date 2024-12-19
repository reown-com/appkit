---
'@reown/appkit-adapter-wagmi': patch
'@reown/appkit': patch
'@reown/appkit-common': patch
'@reown/appkit-adapter-bitcoin': patch
'@reown/appkit-adapter-ethers': patch
'@reown/appkit-adapter-ethers5': patch
'@reown/appkit-adapter-solana': patch
'@reown/appkit-utils': patch
'@reown/appkit-cdn': patch
'@reown/appkit-cli': patch
'@reown/appkit-core': patch
'@reown/appkit-experimental': patch
'@reown/appkit-polyfills': patch
'@reown/appkit-scaffold-ui': patch
'@reown/appkit-siwe': patch
'@reown/appkit-siwx': patch
'@reown/appkit-ui': patch
'@reown/appkit-wallet': patch
'@reown/appkit-wallet-button': patch
---

Fixed an issue where the `pendingTransactions` event was being emitted infinitely in wagmi adapter.

Additionally another parameter was added to wagmi adapter called `pendingTransactionFilter`.

**Example usage**

```ts
const wagmiAdapter = new WagmiAdapter({
  networks: [/* Your Networks */],
  projectId: "YOUR_PROJECT_ID",
  pendingTransactionFilter: {
    enable: true,
    pollingInterval: 15_000
  }
});

createAppKit({
  adapters: [wagmiAdapter],
  networks: [/* Your Networks */],
  projectId: "YOUR_PROJECT_ID"
});
```


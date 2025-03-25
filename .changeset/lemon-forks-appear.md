---
'@reown/appkit-adapter-wagmi': patch
'@reown/appkit-utils': patch
'@reown/appkit-controllers': patch
'@reown/appkit': patch
'@reown/appkit-common': patch
'@reown/appkit-adapter-bitcoin': patch
'@reown/appkit-adapter-ethers': patch
'@reown/appkit-adapter-ethers5': patch
'@reown/appkit-adapter-solana': patch
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

Adds `customRpcUrls` prop to override default RPC URLs of the networks for native RPC calls.

**Example**

Define your map of chain ID / URL objects:

```jsx
const customRpcUrls = {
  1: [{ url: 'https://your-custom-mainnet-url.com' }],
  137: [{ url: 'https://your-custom-polygon-url.com' }]
}
```

Pass it to the AppKit's `createAppKit` function.

Additionally, if you are using Wagmi adapter you need to pass same `customRpcUrls` prop to `WagmiAdapter`.

```jsx
const wagmiAdapter = new WagmiAdapter({
  networks: [...],
  projectId: "project-id",
  customRpcUrls
})

const modal = createAppKit({
  adapters: [...],
  networks: [...],
  projectId: "project-id",
  customRpcUrls
})
```

**Passing network props**

If you need to pass fetch configs for your transport, you can use `config` property:

```jsx
const customRpcUrls = {
  1: [
    {
      url: "https://your-custom-mainnet-url.com",
      config: {
        fetchOptions: {
          headers: {
            "Content-Type": "text/plain",
          },
        },
      },
    },
  ]
};
```

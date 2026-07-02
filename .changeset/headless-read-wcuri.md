---
'@reown/appkit-utils': patch
'@reown/appkit': patch
'@reown/appkit-cdn': patch
'@reown/appkit-cli': patch
'@reown/appkit-codemod': patch
'@reown/appkit-common': patch
'@reown/appkit-core': patch
'@reown/appkit-experimental': patch
'@reown/appkit-pay': patch
'@reown/appkit-polyfills': patch
'@reown/appkit-scaffold-ui': patch
'@reown/appkit-siwe': patch
'@reown/appkit-siwx': patch
'@reown/appkit-testing': patch
'@reown/appkit-ui': patch
'@reown/appkit-universal-connector': patch
'@reown/appkit-wallet-button': patch
'@reown/appkit-wallet': patch
'@reown/appkit-controllers': patch
'@reown/appkit-adapter-bitcoin': patch
'@reown/appkit-adapter-ethers': patch
'@reown/appkit-adapter-ethers5': patch
'@reown/appkit-adapter-solana': patch
'@reown/appkit-adapter-ton': patch
'@reown/appkit-adapter-tron': patch
'@reown/appkit-adapter-wagmi': patch
---

Add a headless read for the WalletConnect URI, so a host can render a QR without the `useAppKitWallets` React hook.

The AppKit instance now exposes `getWalletConnectUri()` — returning `{ wcUri, wcError, wcFetchingUri }` — and `subscribeWalletConnectUri()`. Both read the connection layer directly (mirroring the existing `getWalletList()` / `subscribeWalletList()` pair), so a headless host gets the URI ungated through the instance without importing `@reown/appkit-controllers` (which can otherwise resolve to a different valtio singleton). This replaces the connection-level `subscribeConnections`, which is gated behind the `multiWallet` remote feature and so can't serve the URI for a single-wallet QR.

**Breaking:** the imperative pre-fetch trigger previously named `getWalletConnectUri()` is renamed to `prefetchWalletConnectUri()`, freeing `getWalletConnectUri()` for the new read.

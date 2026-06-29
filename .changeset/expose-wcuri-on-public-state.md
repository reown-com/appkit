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

Expose the WalletConnect URI on the public AppKit state, so a headless host can render a QR without the `useAppKitWallets` React hook.

`getState()` / `subscribeState()` now include `wcUri`, `wcError`, and `wcFetchingUri` — the symmetric *read* for the existing `getWalletConnectUri()` trigger. These are mirrored from the connection layer onto the public state, so headless consumers read them ungated through the AppKit instance (the connection-level `subscribeConnections` is gated behind the `multiWallet` remote feature and so can't serve the URI for a single-wallet QR).

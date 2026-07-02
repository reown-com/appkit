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

Add headless reset methods for the WalletConnect URI + connecting-wallet state.

The AppKit instance now exposes `resetWalletConnectUri()` and `resetConnectingWallet()` — thin passthroughs to `HeadlessWalletUtil.resetWcUri()` / `resetConnectingWallet()`. A headless host that reads the URI via `getWalletConnectUri()` can now clear it (e.g. when a QR is dismissed or a connection is cancelled) through the instance, without importing `@reown/appkit-controllers`. This completes the headless WalletConnect-URI surface alongside `getWalletConnectUri` / `subscribeWalletConnectUri` / `prefetchWalletConnectUri`.

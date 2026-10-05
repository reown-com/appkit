---
'@reown/appkit-ui': patch
'pay-test-exchange': patch
'@reown/appkit-adapter-bitcoin': patch
'@reown/appkit-adapter-ethers': patch
'@reown/appkit-adapter-ethers5': patch
'@reown/appkit-adapter-solana': patch
'@reown/appkit-adapter-stellar': patch
'@reown/appkit-adapter-ton': patch
'@reown/appkit-adapter-tron': patch
'@reown/appkit-adapter-wagmi': patch
'@reown/appkit': patch
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
'@reown/appkit-universal-connector': patch
'@reown/appkit-wallet': patch
'@reown/appkit-wallet-button': patch
---

AppKit and the wagmi adapter now pick up WalletConnect sessions that Universal Provider creates, restores or updates outside AppKit's own connect flow, for example when an app calls `universalProvider.connect()` directly. Before, AppKit could show "disconnected" while a session was live.

- A session that connects outside AppKit is synced into AppKit's state, and wagmi reconnects to it, also when EVM is the active chain.
- A `session_update` re-syncs the namespaces on WalletConnect.
- On reload, a session that AppKit has no stored connector for is restored as a WalletConnect connection.
- In multi-wallet setups, these syncs only touch namespaces on WalletConnect (or with no connector yet), so they never take a namespace from another wallet.

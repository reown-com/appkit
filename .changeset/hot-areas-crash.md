---
'@reown/appkit-adapter-ethers5': patch
'@reown/appkit-adapter-ethers': patch
'pay-test-exchange': patch
'@reown/appkit-adapter-bitcoin': patch
'@reown/appkit-adapter-solana': patch
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
'@reown/appkit-ui': patch
'@reown/appkit-universal-connector': patch
'@reown/appkit-wallet': patch
'@reown/appkit-wallet-button': patch
---

fix(ethers,ethers5): resolve walletProvider after account switch in modal

`useAppKitProvider` returned a stale provider when switching accounts inside the
modal. In the early-return path of `connect()`, `connector.provider` was never
initialised, causing the base-client's `accountChanged` handler to skip
`syncProvider()`. The provider is now resolved from `ethersProviders` before the
event is emitted.
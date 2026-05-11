---
"@reown/appkit-adapter-ethers": patch
"@reown/appkit-adapter-ethers5": patch
---

fix(ethers,ethers5): resolve walletProvider after account switch in modal

`useAppKitProvider` returned a stale provider when switching accounts inside the
modal. In the early-return path of `connect()`, `connector.provider` was never
initialised, causing the base-client's `accountChanged` handler to skip
`syncProvider()`. The provider is now resolved from `ethersProviders` before the
event is emitted.

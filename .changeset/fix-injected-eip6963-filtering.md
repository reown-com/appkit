---
'@reown/appkit': patch
'@reown/appkit-controllers': patch
'@reown/appkit-adapter-wagmi': patch
---

Fix injected and EIP6963 wallets showing despite being disabled and appearing duplicated. `enableInjected` is now wired through to the controller state, the wagmi adapter no longer conflates the basic injected connector with EIP6963-discovered ones, featured/recommended wallets are deduped against connectors regardless of the `enableEIP6963` flag, and `includeWalletIds`/`excludeWalletIds` now also filter injected and EIP6963 connectors in the connect view.

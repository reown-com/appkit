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

Recover Coinbase Wallet from the EIP-1193 `4100` ("Must call 'eth_requestAccounts' before other methods") error that could dead-end signing after a session restore.

On an AppKit auto-restore, the Coinbase Wallet SDK provider keeps its accounts but drops its internal authorization — unlike wagmi's own `reconnect`, AppKit's restore reads `eth_accounts` without re-issuing `eth_requestAccounts`. Consumers that call `.request()` directly on the provider (rather than through wagmi's hooks) then failed the first signing RPC with `4100`.

The provider registration seam (`syncProvider`) now wraps Coinbase eip155 providers — keyed on the connector `id`, which is stable across the wagmi, ethers, and ethers5 adapters (the provider "type" is remapped to `'EXTERNAL'` on most paths, so it can't be used to detect Coinbase). A `4100` then triggers a one-shot recovery: a single `eth_requestAccounts` re-authorization, an active-chain re-assert before an `eth_sendTransaction` retry (so the transaction can't broadcast on the wrong network after the handshake resets the SDK's chain), then exactly one retry. Non-`4100` errors, rejected re-auth prompts, and non-Coinbase providers are unaffected. The wrapper is cached per provider instance so consumers keep a stable reference.

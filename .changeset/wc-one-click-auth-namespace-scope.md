---
'@reown/appkit-controllers': patch
---

Fixed WalletConnect one-click auth being silently skipped whenever more than one chain namespace is registered.

`WalletConnectConnector.authenticate()` passed `this.chains` — which resolves to every registered namespace rather than the connector's own — to `SIWXUtil.universalProviderAuthenticate`, which only proceeds for a single `eip155` namespace. Any app registering a second namespace alongside EVM (for example Solana) therefore lost one-click auth for every wallet and fell back to connecting first and requesting a separate `personal_sign`. The chain list is now scoped to the connector's own namespace.

---
"@reown/appkit-controllers": patch
"@reown/appkit-utils": patch
---

Fix `createNamespaces` using `id` to reconstruct CAIP network ID instead of the existing `caipNetworkId` property. For standard chains these are equivalent, but for custom chains (e.g. Neo3, Stellar) where the chain `id` differs from the CAIP-2 chain reference, the wrong namespace was sent to wallets over WalletConnect. Also fixes `rpcMap` keys to use the full `caipNetworkId`.

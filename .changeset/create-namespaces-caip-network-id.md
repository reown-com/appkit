---
'@reown/appkit-utils': patch
---

Use `caipNetworkId` in `createNamespaces` instead of reconstructing `${chainNamespace}:${id}`, so custom adapters (Stellar, Neo3) advertise the WalletConnect chain id wallets actually expect.

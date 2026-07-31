---
'@reown/appkit': patch
'@reown/appkit-controllers': patch
---

Route EVM WalletConnect signatures through the shared connector.

The shared WalletConnect connector now passes the captured CAIP network to UniversalProvider
instead of relying on mutable provider state. This applies consistently across EVM adapters, and
provider errors retain their original cause.

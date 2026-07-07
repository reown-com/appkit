---
'@reown/appkit-controllers': patch
'@reown/appkit-scaffold-ui': patch
---

fix: persist the universal-link base as the WalletConnect deeplink choice when `experimental_preferUniversalLinks` is enabled, so session-request re-opens (handled by universal-provider) use the wallet's universal link instead of falling back to its native custom scheme

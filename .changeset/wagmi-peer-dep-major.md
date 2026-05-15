---
'@reown/appkit-adapter-wagmi': patch
'@reown/appkit-controllers': patch
'@reown/appkit-common': patch
'@reown/appkit-utils': patch
'@reown/appkit': patch
---

Constrain `wagmi`, `@wagmi/core`, `@wagmi/connectors`, and `viem` peer/dependency ranges to their supported major versions (`^` instead of `>=`). This prevents fresh installs from resolving to incompatible majors (e.g. wagmi v3) and removes the unmet-peer warnings reported in #5492.

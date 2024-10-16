---
'@apps/laboratory': patch
'@reown/appkit-core': patch
'@apps/demo': patch
'@apps/gallery': patch
'@reown/appkit-adapter-ethers': patch
'@reown/appkit-adapter-ethers5': patch
'@reown/appkit-adapter-polkadot': patch
'@reown/appkit-adapter-solana': patch
'@reown/appkit-adapter-wagmi': patch
'@reown/appkit': patch
'@reown/appkit-utils': patch
'@reown/appkit-cdn': patch
'@reown/appkit-common': patch
'@reown/appkit-experimental': patch
'@reown/appkit-polyfills': patch
'@reown/appkit-scaffold-ui': patch
'@reown/appkit-siwe': patch
'@reown/appkit-ui': patch
'@reown/appkit-wallet': patch
---

Refactored token balance error messages and ensured that token balances are only fetched again after 5 seconds if the token balance API fails.
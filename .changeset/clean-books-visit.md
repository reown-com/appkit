---
'@reown/appkit-adapter-ethers5': patch
'@reown/appkit-adapter-ethers': patch
'@reown/appkit-adapter-wagmi': patch
'@reown/appkit-scaffold-ui': patch
'@apps/laboratory': patch
'@reown/appkit': patch
'@reown/appkit-ui': patch
'@apps/demo': patch
'@apps/gallery': patch
'@reown/appkit-adapter-polkadot': patch
'@reown/appkit-adapter-solana': patch
'@reown/appkit-utils': patch
'@reown/appkit-cdn': patch
'@reown/appkit-common': patch
'@reown/appkit-core': patch
'@reown/appkit-experimental': patch
'@reown/appkit-polyfills': patch
'@reown/appkit-siwe': patch
'@reown/appkit-siwx': patch
'@reown/appkit-wallet': patch
---

Fixes an issue where using ethers/ethers5 adapters caused the Coinbase Wallet to not reconnect after refreshing the page.
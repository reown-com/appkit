---
'@reown/appkit-adapter-ethers5': patch
'@reown/appkit-adapter-ethers': patch
'@reown/appkit-utils': patch
'@reown/appkit': patch
'@reown/appkit-adapter-bitcoin': patch
'@reown/appkit-adapter-solana': patch
'@reown/appkit-adapter-wagmi': patch
'@reown/appkit-cdn': patch
'@reown/appkit-cli': patch
'@reown/appkit-common': patch
'@reown/appkit-core': patch
'@reown/appkit-experimental': patch
'@reown/appkit-polyfills': patch
'@reown/appkit-scaffold-ui': patch
'@reown/appkit-siwe': patch
'@reown/appkit-siwx': patch
'@reown/appkit-ui': patch
'@reown/appkit-wallet': patch
'@reown/appkit-wallet-button': patch
---

Fixes issue where switching to an unrecognized chain in MM mobile resulted in INVALID_CHAIN error which was not parsed for wallet_addEthereumChain request

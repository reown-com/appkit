---
'@reown/appkit-adapter-ethers5': patch
'@reown/appkit-adapter-ethers': patch
'@reown/appkit-adapter-solana': patch
'@reown/appkit-adapter-wagmi': patch
'@reown/appkit-wallet-button': patch
'@reown/appkit-utils': patch
'@reown/appkit-scaffold-ui': patch
'@reown/appkit': patch
'@reown/appkit-core': patch
'@reown/appkit-siwe': patch
'@reown/appkit-siwx': patch
'@reown/appkit-ui': patch
'@reown/appkit-adapter-bitcoin': patch
'@reown/appkit-cdn': patch
'@reown/appkit-cli': patch
'@reown/appkit-common': patch
'@reown/appkit-experimental': patch
'@reown/appkit-polyfills': patch
'@reown/appkit-wallet': patch
---

Splits code into basic and regular appkit. Re-exports ui and scaffold components so they can be tree-shaken. Dynamically import appropiate chunks according to feature flags'

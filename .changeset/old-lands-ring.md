---
'@reown/appkit-adapter-bitcoin': patch
'@reown/appkit-adapter-ethers5': patch
'@reown/appkit-adapter-ethers': patch
'@reown/appkit-adapter-solana': patch
'@reown/appkit-adapter-wagmi': patch
'@reown/appkit-utils': patch
'@reown/appkit-controllers': patch
'@reown/appkit': patch
'@reown/appkit-siwe': patch
'@reown/appkit-cdn': patch
'@reown/appkit-cli': patch
'@reown/appkit-common': patch
'@reown/appkit-core': patch
'@reown/appkit-experimental': patch
'@reown/appkit-pay': patch
'@reown/appkit-polyfills': patch
'@reown/appkit-scaffold-ui': patch
'@reown/appkit-siwx': patch
'@reown/appkit-ui': patch
'@reown/appkit-wallet': patch
'@reown/appkit-wallet-button': patch
---

Fixed a bug where wagmi adapter wasn't using the dedicated `.getProvider()` api but a custom `.provider` prop which is unreliable in getting the provider

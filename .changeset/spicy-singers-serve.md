---
'@reown/appkit-adapter-solana': patch
'@reown/appkit-adapter-ethers': patch
'@reown/appkit-adapter-ethers5': patch
'@reown/appkit-adapter-wagmi': patch
'@reown/appkit': patch
'@reown/appkit-utils': patch
'@reown/appkit-cdn': patch
'@reown/appkit-common': patch
'@reown/appkit-core': patch
'@reown/appkit-experimental': patch
'@reown/appkit-polyfills': patch
'@reown/appkit-scaffold-ui': patch
'@reown/appkit-siwe': patch
'@reown/appkit-siwx': patch
'@reown/appkit-ui': patch
'@reown/appkit-wallet': patch
---

Fixed an issue where the Solana adapter would continue to return `walletProvider.publicKey` from the `useAppKitProvider` hook even after disconnection.
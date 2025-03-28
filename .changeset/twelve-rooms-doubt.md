---
'@reown/appkit-utils': patch
'@reown/appkit': patch
'@reown/appkit-adapter-bitcoin': patch
'@reown/appkit-adapter-ethers': patch
'@reown/appkit-adapter-ethers5': patch
'@reown/appkit-adapter-solana': patch
'@reown/appkit-adapter-wagmi': patch
'@reown/appkit-cdn': patch
'@reown/appkit-cli': patch
'@reown/appkit-common': patch
'@reown/appkit-controllers': patch
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

Fixes issue where switchin between appkit instances result network to be not detected as expected.

When AppKit initialized, if local storage active CAIP network value is something AppKit doesn't support, AppKit will redirect to first available network.

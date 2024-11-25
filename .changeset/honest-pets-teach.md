---
'@reown/appkit': patch
'@reown/appkit-siwe': patch
'@apps/demo': patch
'@apps/gallery': patch
'@reown/appkit-adapter-ethers': patch
'@reown/appkit-adapter-ethers5': patch
'@reown/appkit-adapter-polkadot': patch
'@reown/appkit-adapter-solana': patch
'@reown/appkit-adapter-wagmi': patch
'@reown/appkit-utils': patch
'@reown/appkit-cdn': patch
'@reown/appkit-common': patch
'@reown/appkit-core': patch
'@reown/appkit-experimental': patch
'@reown/appkit-polyfills': patch
'@reown/appkit-scaffold-ui': patch
'@reown/appkit-siwx': patch
'@reown/appkit-ui': patch
'@reown/appkit-wallet': patch
---

- Fix onSignOut not being called for activeCaipAddress changes;
- Fix signOut/onSignOut not being called on useDisconnect hook calls;
- Fix AppKitSIWEClient signIn and signOut methods to call new SIWX handlers;
- Add tests for mapToSIWX function and usage against AppKit.

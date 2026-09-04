---
'@reown/appkit-utils': patch
'@reown/appkit-common': patch
'pay-test-exchange': patch
'@reown/appkit-adapter-bitcoin': patch
'@reown/appkit-adapter-ethers': patch
'@reown/appkit-adapter-ethers5': patch
'@reown/appkit-adapter-solana': patch
'@reown/appkit-adapter-stellar': patch
'@reown/appkit-adapter-ton': patch
'@reown/appkit-adapter-tron': patch
'@reown/appkit-adapter-wagmi': patch
'@reown/appkit': patch
'@reown/appkit-cdn': patch
'@reown/appkit-cli': patch
'@reown/appkit-codemod': patch
'@reown/appkit-controllers': patch
'@reown/appkit-core': patch
'@reown/appkit-experimental': patch
'@reown/appkit-pay': patch
'@reown/appkit-polyfills': patch
'@reown/appkit-scaffold-ui': patch
'@reown/appkit-siwe': patch
'@reown/appkit-siwx': patch
'@reown/appkit-testing': patch
'@reown/appkit-ui': patch
'@reown/appkit-universal-connector': patch
'@reown/appkit-wallet': patch
'@reown/appkit-wallet-button': patch
---

Added Stellar support via WalletConnect through the new `@reown/appkit-adapter-stellar` package. Supports the `stellar:pubnet` and `stellar:testnet` networks and the `stellar_signXDR`, `stellar_signAndSubmitXDR`, `stellar_signMessage` and `stellar_signAuthEntry` methods, along with a SIWX verifier for SEP-53 signatures. Stellar wallets connect over WalletConnect only -- there is no extension wallet support.

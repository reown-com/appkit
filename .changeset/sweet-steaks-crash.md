---
'@reown/appkit-adapter-wagmi': patch
'@reown/appkit-controllers': patch
'@reown/appkit-siwx': patch
'pay-test-exchange': patch
'@reown/appkit-adapter-bitcoin': patch
'@reown/appkit-adapter-ethers': patch
'@reown/appkit-adapter-ethers5': patch
'@reown/appkit-adapter-solana': patch
'@reown/appkit-adapter-ton': patch
'@reown/appkit-adapter-tron': patch
'@reown/appkit': patch
'@reown/appkit-utils': patch
'@reown/appkit-cdn': patch
'@reown/appkit-cli': patch
'@reown/appkit-codemod': patch
'@reown/appkit-common': patch
'@reown/appkit-core': patch
'@reown/appkit-experimental': patch
'@reown/appkit-pay': patch
'@reown/appkit-polyfills': patch
'@reown/appkit-scaffold-ui': patch
'@reown/appkit-siwe': patch
'@reown/appkit-testing': patch
'@reown/appkit-ui': patch
'@reown/appkit-universal-connector': patch
'@reown/appkit-wallet': patch
'@reown/appkit-wallet-button': patch
---

fix(siwx): resolve multichain wallet signing race condition

Fixed an issue where SIWX signing would fail with multichain wallets (Trust Wallet, SafePal) when the active namespace changed between message creation and signing.
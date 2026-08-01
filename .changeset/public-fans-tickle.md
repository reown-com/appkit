---
'@reown/appkit-adapter-wagmi': patch
'@reown/appkit-controllers': patch
'@reown/appkit-siwx': patch
---

fix(siwx): resolve multichain wallet signing race condition

Fixed an issue where SIWX signing would fail with multichain wallets (Trust Wallet, SafePal) when the active namespace changed between message creation and signing.

**Root cause:** When using WalletConnect with multichain wallets, `UniversalProvider.setDefaultChain()` would be called during namespace switches, causing subsequent signing requests to target the wrong chain.

**Solution:** Pass `caipNetworkId` explicitly to `UniversalProvider.request()` as the second parameter to ensure the correct chain context is used, regardless of the current default chain state.

---
'@reown/appkit-controllers': patch
---

Fixed one-click auth (`wc_sessionAuthenticate`) ignoring `universalProviderConfigOverride.methods.eip155`. The WalletConnect connector now passes the overridden EVM methods to `authenticate`, so the ReCap in the SIWE message lists only the methods the dApp asked for. Without an override, the default method list is unchanged.

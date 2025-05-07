---
'@reown/appkit-adapter-wagmi': patch
---

Fixed a bug where wagmi adapter wasn't using the dedicated `.getProvider()` api but a custom `.provider` prop which is unreliable in getting the provider

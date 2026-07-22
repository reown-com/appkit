---
'@reown/appkit-controllers': patch
---

Fix Solflare and other custom-deeplink wallets failing to open on mobile in headless mode. The headless `connect()` now routes Phantom, Solflare, Coinbase, and Binance through `MobileWalletUtil.handleMobileDeeplinkRedirect` (their Universal Link `…/ul/v1/browse/…` format) instead of building a `<mobile_link>wc?uri=…` URL that Solflare's app does not handle. Matches the existing headful `selectWalletConnector` behavior.

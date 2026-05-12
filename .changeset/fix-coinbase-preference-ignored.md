---
"@reown/appkit-adapter-wagmi": patch
---

Fix `coinbasePreference` option being ignored — `'all'` and `'eoaOnly'` now correctly use the `coinbaseWallet` connector (with QR code support) instead of always using `baseAccount`. `'smartWalletOnly'` uses `baseAccount`. Regression introduced in PR #5269.

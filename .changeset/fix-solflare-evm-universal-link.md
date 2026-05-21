---
'@reown/appkit-controllers': patch
---

Allow Solflare's Universal Link to also open when the active namespace is EVM, not only Solana. Solflare's in-app browser exposes both `window.solflare` (Solana) and `window.ethereum` (EVM), so the same `https://solflare.com/ul/v1/browse/<dapp_url>` deeplink is the correct entry point for EVM dApps too. Without this, EVM-only consumers (no Solana adapter registered) fell through to `solflare://wc?uri=…`, which Solflare's app does not handle.

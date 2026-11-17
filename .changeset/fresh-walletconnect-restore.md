---
"@reown/appkit": patch
"@reown/appkit-controllers": patch
---

Clear stale WalletConnect connection state during restoration when the initialized provider has no session accounts for the namespace.

Preserve the active account address when resetting a different chain namespace.

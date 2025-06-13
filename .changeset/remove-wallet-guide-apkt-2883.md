---
'@reown/appkit': major
---

Remove wallet guide component and related functionality (APKT-2883)

BREAKING CHANGE: The `enableWalletGuide` configuration option and `w3m-wallet-guide` component have been completely removed from AppKit.

This addresses UI bugs where:
- The top section was empty when email/social was disabled and users clicked "Haven't got a wallet?"
- The "or" separator was displayed twice when email/social was enabled
- Conflicts with the "UX by Reown" component

Migration: Remove the `enableWalletGuide` option from your AppKit configuration as it no longer exists.

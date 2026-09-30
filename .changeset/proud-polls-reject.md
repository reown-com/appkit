---
'@reown/appkit-adapter-solana': patch
---

Fixed `waitForSignatureConfirmationKit` leaving its promise pending forever when a signature status request failed. Errors from the RPC are now propagated to the caller instead of escaping as an unhandled rejection, and polls are issued serially so a slow RPC can no longer stack up overlapping requests.

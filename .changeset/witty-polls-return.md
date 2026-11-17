---
'@reown/appkit-adapter-solana': patch
---

Fixed the legacy Solana confirmation polling used by `sendTransaction` and `writeSolanaTransaction`. A failed `getSignatureStatus` request now rejects instead of leaving the call pending forever, and polls are issued serially so a slow RPC can no longer stack up overlapping requests. The duplicated polling loop in both methods was replaced with a shared `waitForSignatureConfirmation` helper.

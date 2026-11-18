---
"@reown/appkit-utils": patch
---

Reject with the original condition error when `HelpersUtil.withRetry` fails, instead of leaving callers waiting on an unresolved promise.

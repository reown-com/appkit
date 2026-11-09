---
'@reown/appkit-utils': patch
---

Reject the promise returned by HelpersUtil.withRetry with the original reason when a condition check throws or rejects, including checks scheduled after an unsuccessful attempt.

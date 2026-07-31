---
'@reown/appkit': patch
'@reown/appkit-controllers': patch
'@reown/appkit-siwx': patch
---

Preserve the SIWX signing context in multichain sessions.

SIWX now keeps the chain, account, and connector captured when the message is created through the
entire signing request instead of re-reading mutable AppKit state.
